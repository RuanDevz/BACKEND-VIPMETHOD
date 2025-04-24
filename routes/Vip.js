const express = require('express');
const router = express.Router();
const { Vip } = require('../models');

// Função para gerar o slug automaticamente
function generateSlug(postDate, name) {
  const date = new Date(postDate);
  const formattedDate = date.toISOString().split('T')[0]; // '2025-10-10'
  const formattedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Substitui qualquer caractere que não for letra ou número por hífen
    .replace(/(^-|-$)/g, '');    // Remove hífens do início/fim
  return `${formattedDate}-${formattedName}`;
}

// Criar conteúdo VIP
router.post('/', async (req, res) => {
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

// Buscar por slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const vipContent = await Vip.findOne({ where: { slug } });

    if (!vipContent) {
      return res.status(404).json({ error: 'Conteúdo VIP não encontrado com esse slug' });
    }

    res.status(200).json(vipContent);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o conteúdo VIP por slug: ' + error.message });
  }
});

// Listar todos
router.get('/', async (req, res) => {
  try {
    const vipContents = await Vip.findAll();
    res.status(200).json(vipContents);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar os conteúdos VIP: ' + error.message });
  }
});

// Buscar por ID
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

// Atualizar
router.put('/:id', async (req, res) => {
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

    // Atualiza slug se name ou postDate forem alterados
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

// Deletar
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
    res.status(500).json({ error: 'Erro ao deletar o conteúdo VIP: ' + error.message });
  }
});

module.exports = router;
