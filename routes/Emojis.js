const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { UserEmojis } = require('../models');

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

// Reagir a um post com um emoji, garantindo apenas uma reação por linkId por usuário
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

    // Verificar se o usuário já reagiu a esse linkId
    const existing = await UserEmojis.findOne({ where: { userId, linkId } });

    if (existing) {
      return res.status(403).json({ error: "Você já reagiu a esse conteúdo." });
    }

    // Caso não tenha reagido, criamos a reação
    await UserEmojis.create({ userId, linkId, emojiName });

    // Incrementar o contador do emoji
    await UserEmojis.increment('count', {
      by: 1,
      where: { emojiName, linkId },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Erro na reação:", err);
    return res.status(500).json({ error: "Erro ao reagir" });
  }
});

// Reagir a vários linkIds de uma vez (opcional)
router.post("/emoji/react-multiple", async (req, res) => {
  const { emojiName, linkIds } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!linkIds || !Array.isArray(linkIds) || linkIds.length === 0 || !emojiName || !token) {
    return res.status(400).json({ error: "linkIds, emojiName e token são obrigatórios" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_VERIFY_ACCESS);
    const userId = decoded.id;

    // Verificar se o usuário já reagiu a algum dos linkIds
    const existingReactions = await UserEmojis.findAll({
      where: {
        userId,
        linkId: linkIds
      }
    });

    if (existingReactions.length > 0) {
      return res.status(403).json({ error: "Você já reagiu a um desses conteúdos." });
    }

    // Adicionar as reações
    const reactions = linkIds.map(linkId => ({
      userId,
      linkId,
      emojiName
    }));

    // Criar as reações em massa
    await UserEmojis.bulkCreate(reactions);

    // Incrementar o contador para cada linkId e emoji
    for (const linkId of linkIds) {
      await UserEmojis.increment('count', {
        by: 1,
        where: { emojiName, linkId },
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Erro ao reagir:", err);
    return res.status(500).json({ error: "Erro ao reagir em múltiplos conteúdos" });
  }
});

module.exports = router;
