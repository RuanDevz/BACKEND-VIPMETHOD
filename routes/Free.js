const express = require('express');
const router = express.Router();
const { Free } = require('../models');
const verifyToken = require('../Middleware/verifyToken');
const isAdmin = require('../Middleware/isAdmin');
const { Op, Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// function generateSlug(postDate, name, existingSlugs = new Set()) {
//   const date = new Date(postDate);
//   const formattedDate = date.toISOString().split('T')[0];

//   const baseName = name
//     .toLowerCase()
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/(^-|-$)/g, '');

//   let slug = `${formattedDate}-${baseName}`;
//   let counter = 1;

//   while (existingSlugs.has(slug)) {
//     slug = `${formattedDate}-${counter}-${baseName}`;
//     counter++;
//   }

//   return slug;
// }


 router.post('/', verifyToken, isAdmin, async (req, res) => {
   try {
     let freeContents = req.body;

    async function generateSlugWithCheck(postDate, name) { /* ... */ }

     if (Array.isArray(freeContents)) {
       for (let i = 0; i < freeContents.length; i++) {
freeContents[i].slug = await generateSlugWithCheck(freeContents[i].postDate, freeContents[i].name);
        freeContents[i].slug = uuidv4();
       }
       const createdContents = await Free.bulkCreate(freeContents);
       return res.status(201).json(createdContents);
     } else {
      freeContents.slug = await generateSlugWithCheck(freeContents.postDate, freeContents.name);
      freeContents.slug = uuidv4();
       const createdContent = await Free.create(freeContents);
       return res.status(201).json(createdContent);
     }
   } catch (error) {
     return res.status(500).json({ error: 'Erro ao criar os conteúdos gratuitos: ' + error.message });
   }
 });

function insertRandomChar(base64Str) {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const randomChar = letters.charAt(Math.floor(Math.random() * letters.length));
  // Insere no 3º caractere (index 2)
  return base64Str.slice(0, 2) + randomChar + base64Str.slice(2);
}

function encodePayloadToBase64(payload) {
  const jsonStr = JSON.stringify(payload);
  const base64Str = Buffer.from(jsonStr).toString('base64');
  return insertRandomChar(base64Str);
}



router.get('/search', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { search, category, month, sortBy = 'id', sortOrder = 'ASC' } = req.query;

    const where = {};
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }
    if (category) {
      where.category = category;
    }
    if (month) {
      where.postDate = {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn('EXTRACT', Sequelize.literal('MONTH FROM "postDate"')),
            month
          )
        ]
      };
    }

    const { count, rows } = await Free.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });

    const payload = {
      page,
      perPage: limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      data: rows
    };

    // Envia o payload codificado
    const encodedPayload = encodePayloadToBase64(payload);
    return res.status(200).json({ data: encodedPayload });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar conteúdos: ' + error.message });
  }
});

// rota GET /
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

    const payload = {
      page,
      perPage: limit,
      data: freeContents,
    };

    const encodedPayload = encodePayloadToBase64(payload);
    res.status(200).json({ data: encodedPayload });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar os conteúdos gratuitos: ' + error.message });
  }
});

// rota GET /:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const freeContent = await Free.findOne({ where: { slug } });

    if (!freeContent) {
      return res.status(404).json({ error: 'Conteúdo gratuito não encontrado com esse slug' });
    }

    const encodedContent = encodePayloadToBase64(freeContent);
    res.status(200).json({ data: encodedContent });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o conteúdo gratuito por slug: ' + error.message });
  }
});

// rota GET /:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const freeContent = await Free.findByPk(id);

    if (!freeContent) {
      return res.status(404).json({ error: 'Conteúdo gratuito não encontrado' });
    }

    const encodedContent = encodePayloadToBase64(freeContent);
    res.status(200).json({ data: encodedContent });
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