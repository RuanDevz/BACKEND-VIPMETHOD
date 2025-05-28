const express = require('express');
const router = express.Router();
const { Vip } = require('../models');
const isAdmin = require('../Middleware/isAdmin');
const verifyToken = require('../Middleware/verifyToken');
const { Op, Sequelize } = require('sequelize');

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
    let vipContents = req.body;

    if (Array.isArray(vipContents)) {
      vipContents = vipContents.map(item => ({
        ...item,
        slug: generateSlug(item.postDate, item.name)
      }));
      const createdContents = await Vip.bulkCreate(vipContents);
      return res.status(201).json(createdContents);
    }

    vipContents.slug = generateSlug(vipContents.postDate, vipContents.name);
    const createdContent = await Vip.create(vipContents);
    res.status(201).json(createdContent);

  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar os conteúdos VIP: ' + error.message });
  }
});

const encodeBase64 = (data) => {
  return Buffer.from(JSON.stringify(data)).toString("base64");
};

// GET /vip/search
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
    const whereClause = {};

    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    if (category) {
      whereClause.category = category;
    }

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

    const vipContents = await Vip.findAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });

    const total = await Vip.count({ where: whereClause });

    const response = {
      page: parseInt(page),
      perPage: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data: vipContents
    };

    res.status(200).json({ data: encodeBase64(response) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar os conteúdos: ' + error.message });
  }
});

// GET /vip/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const vipContent = await Vip.findOne({ where: { slug } });

    if (!vipContent) {
      return res.status(404).json({ error: 'Conteúdo VIP não encontrado com esse slug' });
    }

    res.status(200).json({ data: encodeBase64(vipContent) });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o conteúdo VIP por slug: ' + error.message });
  }
});

// GET /vip
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 900;
    const offset = (page - 1) * limit;

    const vipContents = await Vip.findAll({
      limit,
      offset,
      order: [['postDate', 'DESC']],
    });

    const response = {
      page,
      perPage: limit,
      data: vipContents,
    };

    res.status(200).json({ data: encodeBase64(response) });
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

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, link, createdAt, postDate } = req.body;

    const vipContentToUpdate = await Vip.findByPk(id);
    if (!vipContentToUpdate) {
      return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
    }

    vipContentToUpdate.name = name;
    vipContentToUpdate.link = link;
    vipContentToUpdate.createdAt = createdAt || vipContentToUpdate.createdAt;
    vipContentToUpdate.postDate = postDate || vipContentToUpdate.postDate;

    if (name || postDate) {
      vipContentToUpdate.slug = generateSlug(
        postDate || vipContentToUpdate.postDate,
        name || vipContentToUpdate.name
      );
    }

    await vipContentToUpdate.save();

    res.status(200).json(vipContentToUpdate);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar o conteúdo VIP: ' + error.message });
  }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const vipContentToDelete = await Vip.findByPk(id);
    if (!vipContentToDelete) {
      return res.status(404).json({ error: 'Conteúdo VIP não encontrado' });
    }

    await vipContentToDelete.destroy();
    res.status(200).json({ message: 'Conteúdo VIP deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar o conteúdo VIP: ' + error.message });
  }
});

module.exports = router;