const express = require('express');
const router = express.Router();
const { Vip } = require('../models'); // Ajuste o caminho conforme necessário

// Create (POST) - Adicionar um novo conteúdo VIP
router.post('/', async (req, res) => {
    try {
        const { name, link } = req.body;
        const newVip = await Vip.create({
            name,
            link,
        });
        res.status(201).json(newVip);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar o conteúdo VIP: ' + error.message });
    }
});

// ...restante do código permanece o mesmo

router.get('/', async (req, res) => {
    try {
        const vips = await Vip.findAll();
        res.status(200).json(vips);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar os conteúdos VIP: ' + error.message });
    }
});

// Read (GET) - Buscar um conteúdo VIP por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const vip = await Vip.findByPk(id);
        if (!vip) {
            return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
        }
        res.status(200).json(vip);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar o conteúdo VIP: ' + error.message });
    }
});

// Update (PUT) - Atualizar um conteúdo VIP
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, link } = req.body;

        const vipToUpdate = await Vip.findByPk(id);
        if (!vipToUpdate) {
            return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
        }

        vipToUpdate.name = name;
        vipToUpdate.link = link;
        await vipToUpdate.save();

        res.status(200).json(vipToUpdate);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o conteúdo VIP: ' + error.message });
    }
});

// Delete (DELETE) - Deletar um conteúdo VIP
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const vipToDelete = await Vip.findByPk(id);
        if (!vipToDelete) {
            return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
        }
//
        await vipToDelete.destroy();
        res.status(200).json({ message: 'Conteúdo VIP deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar o conteúdo VIP: ' + error.message });
    }
});

module.exports = router;
