const express = require('express');
const router = express.Router();
const { Free } = require('../models');
const verifyToken = require('../Middleware/verifyToken');
const isAdmin = require('../Middleware/isAdmin');

function generateSlug(postDate, name) {
    const date = new Date(postDate);
    date.setDate(date.getDate() - 1); 
    const formattedDate = date.toISOString().split('T')[0]; 
    const formattedName = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') 
      .replace(/(^-|-$)/g, '');   
    return `${formattedDate}-${formattedName}`;
  }

router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        let freeContents = req.body;

        if (Array.isArray(freeContents)) {
            freeContents = freeContents.map(item => ({
                ...item,
                slug: generateSlug(item.postDate, item.name)
            }));
            const createdContents = await Free.bulkCreate(freeContents);
            return res.status(201).json(createdContents);
        } 
        
        // Se for um único objeto
        freeContents.slug = generateSlug(freeContents.postDate, freeContents.name);
        const createdContent = await Free.create(freeContents);
        res.status(201).json(createdContent);
        
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar os conteúdos gratuitos: ' + error.message });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const freeContent = await Free.findOne({ where: { slug } });

        if (!freeContent) {
            return res.status(404).json({ error: 'Conteúdo gratuito não encontrado com esse slug' });
        }

        res.status(200).json(freeContent);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar o conteúdo gratuito por slug: ' + error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        // Pegando página e limite dos query params, com valores padrão
        const page = parseInt(req.query.page) || 1; // página atual (default 1)
        const limit = 900; // número fixo de conteúdos por página
        const offset = (page - 1) * limit; // a partir de qual registro começar

        // Buscar conteúdos com paginação, ordenando pela data mais recente
        const freeContents = await Free.findAll({
            limit,
            offset,
            order: [['postDate', 'DESC']], // mais recentes primeiro
        });

        res.status(200).json({
            page,
            perPage: limit,
            data: freeContents,
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar os conteúdos gratuitos: ' + error.message });
    }
});

// Buscar um conteúdo gratuito por ID (GET)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const freeContent = await Free.findByPk(id);
        if (!freeContent) {
            return res.status(404).json({ error: 'Conteúdo gratuito não encontrado' });
        }
        res.status(200).json(freeContent);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar o conteúdo gratuito' });
    }
});

// Atualizar (PUT) - Atualizar conteúdo gratuito
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, link, createdAt } = req.body; // Incluindo 'createdAt' no corpo da requisição

        const freeContentToUpdate = await Free.findByPk(id);
        if (!freeContentToUpdate) {
            return res.status(404).json({ error: 'Conteúdo gratuito não encontrado' });
        }

        freeContentToUpdate.name = name;
        freeContentToUpdate.link = link;
        freeContentToUpdate.createdAt = createdAt || freeContentToUpdate.createdAt; // Atualiza a data se passada, senão mantém a existente

        await freeContentToUpdate.save();

        res.status(200).json(freeContentToUpdate);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar o conteúdo gratuito' });
    }
});

// Deletar (DELETE) - Deletar conteúdo gratuito
router.delete('/:id',verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const freeContentToDelete = await Free.findByPk(id);
        if (!freeContentToDelete) {
            return res.status(404).json({ error: 'Conteúdo gratuito não encontrado' });
        }

        await freeContentToDelete.destroy();
        res.status(200).json({ message: 'Conteúdo gratuito deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar o conteúdo gratuito' });
    }
});

module.exports = router;
