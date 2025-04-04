const express = require('express');
const router = express.Router();
const { Vip } = require('../models');

router.post('/', async (req, res) => {
    try {
        const vipContents = req.body;

        let createdContents;
        if (Array.isArray(vipContents)) {
            createdContents = await Vip.bulkCreate(vipContents);
        } else {
            createdContents = await Vip.create(vipContents);
        }

        res.status(201).json(createdContents);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar os conteúdos VIP: ' + error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const vipContents = await Vip.findAll();
        res.status(200).json(vipContents);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar os conteúdos VIP: ' + error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const vipContent = await Vip.findByPk(id);
        if (!vipContent) {
            return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
        }
        res.status(200).json(vipContent);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar o conteúdo VIP' });
    }
});

// Atualizar (PUT) - Atualizar conteúdo VIP
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, link, createdAt } = req.body; // Incluindo 'createdAt' no corpo da requisição

        const vipContentToUpdate = await Vip.findByPk(id);
        if (!vipContentToUpdate) {
            return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
        }

        vipContentToUpdate.name = name;
        vipContentToUpdate.link = link;
        vipContentToUpdate.createdAt = createdAt || vipContentToUpdate.createdAt; // Atualiza a data se passada, senão mantém a existente

        await vipContentToUpdate.save();

        res.status(200).json(vipContentToUpdate);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o conteúdo VIP' });
    }
});

// Deletar (DELETE) - Deletar conteúdo VIP
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const vipContentToDelete = await Vip.findByPk(id);
        if (!vipContentToDelete) {
            return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
        }

        await vipContentToDelete.destroy();
        res.status(200).json({ message: 'Conteúdo VIP deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar o conteúdo VIP' });
    }
});

module.exports = router;
