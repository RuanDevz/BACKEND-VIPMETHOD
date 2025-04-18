const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken')
const {UserEmojis} = require('../models')


// Buscar um emoji específico para um post
router.get("/emoji/:emojiName/:linkId", async (req, res) => {
  const { emojiName, linkId } = req.params;

  try {
    const emoji = await UserEmojis.findOne({ where: { emojiName, linkId } });
    if (!emoji) return res.status(404).json({ message: "Emoji não encontrado" });

    res.json({ emojiName: emoji.emojiName, count: emoji.count });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar emoji" });
  }
});

// Buscar todos os emojis para todos os posts (usado no frontend atual)
router.get("/emojis", async (req, res) => {
  try {
    const emojis = await UserEmojis.findAll({
      attributes: ['emojiName', 'count', 'linkId'],
      order: [['count', 'DESC']],
    });

    res.json(emojis);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar os emojis" });
  }
});

// Resetar contador de emoji para um post específico
router.post("/emoji/:emojiName/react", async (req, res) => {
  const { emojiName } = req.params;
  const { linkId } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!linkId || !token) {
    return res.status(400).json({ error: "linkId e token são obrigatórios" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_VERIFY_ACCESS);
    const userId = decoded.id;

    const existing = await UserEmojis.findOne({ where: { userId, linkId } });

    if (existing) {
      if (existing.emojiName === emojiName) {
        return res.status(403).json({ error: "Você já reagiu com esse emoji." });
      }

      // Subtrai do emoji antigo
      await UserEmojis.decrement('count', {
        by: 1,
        where: { emojiName: existing.emojiName, linkId }
      });

      await UserEmojis.increment('count', {
        by: 1,
        where: { emojiName, linkId }
      });

      existing.emojiName = emojiName;
      await existing.save();
    } else {
      // Primeiro emoji desse user para esse conteúdo
      await UserEmojis.create({ userId, linkId, emojiName: emojiName });

      await UserEmojis.increment('count', {
        by: 1,
        where: { emojiName, linkId }
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Erro na reação:", err);
    return res.status(500).json({ error: "Erro ao reagir" });
  }
});

module.exports = router;
