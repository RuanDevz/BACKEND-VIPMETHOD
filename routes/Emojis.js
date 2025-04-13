const express = require('express');
const router = express.Router();
const { Emojis } = require('../models');

router.post("/emoji/:name/react", async (req, res) => {
  const { name } = req.params;

  try {
    const emoji = await Emojis.findOne({ where: { name } });
    if (!emoji) return res.status(404).json({ message: "Emoji não encontrado" });

    emoji.count += 1;
    await emoji.save();

    res.json({ success: true, count: emoji.count });
  } catch (err) {
    res.status(500).json({ error: "Erro ao reagir com emoji" });
  }
});

router.get("/emoji/:name", async (req, res) => {
  const { name } = req.params;

  try {
    const emoji = await Emojis.findOne({ where: { name } });
    if (!emoji) return res.status(404).json({ message: "Emoji não encontrado" });

    res.json({ name: emoji.name, count: emoji.count });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar emoji" });
  }
});

// Obter todos os emojis com seus contadores
router.get("/emojis", async (req, res) => {
  try {
    const emojis = await Emojis.findAll({
      attributes: ['name', 'count']
    });

    res.json(emojis);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar os emojis" });
  }
});

module.exports = router;
