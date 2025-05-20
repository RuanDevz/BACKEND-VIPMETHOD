const express = require('express');
const router = express.Router();
const { Free } = require('../models');
const verifyToken = require('../Middleware/verifyToken');
const isAdmin = require('../Middleware/isAdmin');
const { Op, Sequelize  } = require('sequelize');

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

    freeContents.slug = generateSlug(freeContents.postDate, freeContents.name);
    const createdContent = await Free.create(freeContents);
    res.status(201).json(createdContent);

  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar os conteúdos gratuitos: ' + error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      month,
      sortBy = 'postDate',
      sortOrder = 'DESC',
      page = 1,
      limit = 900
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = {};

    // Add search condition if search query exists
    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    // Add category filter if category exists
    if (category) {
      whereClause.category = category;
    }

    // Add month filter if month exists
    if (month) {
      whereClause.postDate = {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('date_part', 'month', Sequelize.col('postDate')),
            month
          )
        ]
      };
    }

    const freeContents = await Free.findAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });

    const total = await Free.count({ where: whereClause });

    res.status(200).json({
      page: parseInt(page),
      perPage: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data: freeContents
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao buscar os conteúdos: ' + error.message 
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 900;
    const offset = (page - 1) * limit;

    const freeContents = await Free.findAll({
      limit,
      offset,
      order: [['postDate', 'DESC']],
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

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const freeContent = await Free.findByPk(id);

    if (!freeContent) {
      return res.status(404).json({ error: 'Conteúdo gratuito não encontrado' });
    }

    res.status(200).json(freeContent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o conteúdo gratuito: ' + error.message });
  }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, link, postDate } = req.body;

    const freeContentToUpdate = await Free.findByPk(id);
    if (!freeContentToUpdate) {
      return res.status(404).json({ error: 'Conteúdo gratuito não encontrado' });
    }

    freeContentToUpdate.name = name !== undefined ? name : freeContentToUpdate.name;
    freeContentToUpdate.link = link !== undefined ? link : freeContentToUpdate.link;
    freeContentToUpdate.postDate = postDate !== undefined ? postDate : freeContentToUpdate.postDate;

    if (name || postDate) {
      freeContentToUpdate.slug = generateSlug(freeContentToUpdate.postDate, freeContentToUpdate.name);
    }

    await freeContentToUpdate.save();

    res.status(200).json(freeContentToUpdate);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o conteúdo gratuito: ' + error.message });
  }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const freeContentToDelete = await Free.findByPk(id);
    if (!freeContentToDelete) {
      return res.status(404).json({ error: 'Conteúdo gratuito não encontrado' });
    }

    await freeContentToDelete.destroy();
    res.status(200).json({ message: 'Conteúdo gratuito deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar o conteúdo gratuito: ' + error.message });
  }
});

module.exports = router;