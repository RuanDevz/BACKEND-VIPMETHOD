const express = require('express');
const router = express.Router();
const db = require('../models');
const checkApiKey = require('../Middleware/CheckapiKey');
const checkAdminKey = require('../Middleware/isAdmin');

const PRIMARY_ID = process.env.ID_LINKVERTISE_PRIMARY;
const SECONDARY_ID = process.env.ID_LINKVERTISE_SECONDARY;

router.get('/', checkApiKey, async (req, res) => {
  try {
    let config = await db.LinkvertiseConfig.findOne({
      where: { id: 1 } 
    });

    if (!config) {
      config = await db.LinkvertiseConfig.create({
        id: 1,
        activeAccount: PRIMARY_ID
      });
    }

    res.json({
      activeAccount: config.activeAccount
    });
  } catch (error) {
    console.error('Erro ao buscar configuração do Linkvertise:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar a configuração do Linkvertise'
    });
  }
});

router.put('/', checkApiKey, checkAdminKey, async (req, res) => {
  try {
    const { activeAccount } = req.body;

    if (!activeAccount || ![PRIMARY_ID, SECONDARY_ID].includes(activeAccount)) {
      return res.status(400).json({
        error: 'Valor inválido',
        message: `activeAccount deve ser "${PRIMARY_ID}" ou "${SECONDARY_ID}"`
      });
    }

    let config = await db.LinkvertiseConfig.findOne({
      where: { id: 1 }
    });

    if (config) {
      await config.update({ activeAccount });
    } else {
      config = await db.LinkvertiseConfig.create({
        id: 1,
        activeAccount
      });
    }

    res.json({
      success: true,
      activeAccount: config.activeAccount,
      message: 'Configuração do Linkvertise atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração do Linkvertise:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar a configuração do Linkvertise'
    });
  }
});

module.exports = router;