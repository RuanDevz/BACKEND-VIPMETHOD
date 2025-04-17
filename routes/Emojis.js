const express = require('express');
const router = express.Router();
const { Emojis } = require('../models');

// Reagir com emoji para um post específico
router.post("/emoji/:name/react", async (req, res) => {
  const { name } = req.params;
  const { linkId } = req.body;

  if (!linkId) {
    return res.status(400).json({ error: "linkId é obrigatório" });
  }

  try {
    const [emoji, created] = await Emojis.findOrCreate({
      where: { name, linkId },
      defaults: { count: 1 },
    });

    if (!created) {
      emoji.count += 1;
      await emoji.save();
    }

    res.json({ success: true, count: emoji.count });
  } catch (err) {
    res.status(500).json({ error: "Erro ao reagir com emoji" });
  }
});

// Buscar um emoji específico para um post
router.get("/emoji/:name/:linkId", async (req, res) => {
  const { name, linkId } = req.params;

  try {
    const emoji = await Emojis.findOne({ where: { name, linkId } });
    if (!emoji) return res.status(404).json({ message: "Emoji não encontrado" });

    res.json({ name: emoji.name, count: emoji.count });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar emoji" });
  }
});

// Buscar todos os emojis para todos os posts (usado no frontend atual)
router.get("/emojis", async (req, res) => {
  try {
    const emojis = await Emojis.findAll({
      attributes: ['name', 'count', 'linkId'],
      order: [['count', 'DESC']],
    });

    res.json(emojis);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar os emojis" });
  }
});

// Resetar contador de emoji para um post específico
router.post("/emoji/:name/reset", async (req, res) => {
  const { name } = req.params;
  const { linkId } = req.body;

  if (!linkId) {
    return res.status(400).json({ error: "linkId é obrigatório" });
  }

  try {
    const emoji = await Emojis.findOne({ where: { name, linkId } });
    if (!emoji) return res.status(404).json({ message: "Emoji não encontrado" });

    emoji.count = 0;
    await emoji.save();

    res.json({ success: true, count: emoji.count });
  } catch (err) {
    res.status(500).json({ error: "Erro ao resetar o emoji" });
  }
});

module.exports = router;
