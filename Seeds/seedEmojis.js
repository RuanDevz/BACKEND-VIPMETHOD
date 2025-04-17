const { Emojis, Free } = require('../models');
const sequelize = require('../models').sequelize;

const emojiList = [
  "cheerpepe", "clownpepe", "cool", "cringepepepet", "HYPED", "HYPERBlob", "krelypie_pepe_thumbs_up", 
  "love", "OKPepe", "peepoyikes_enh", "pepe_coolclap", "Pepe_HandsRainbow", "Pepe_Poooooopoo",
  "Pepe_PrayRainbow", "pepe_saber", "Pepe_Vanish", "Pepe_whiteEyes", "pepe_yesRainbow", 
  "pepecryyay", "PepeGun", "PepeHeart", "PepeHmm", "PepeHowdy", "pepejob", "pepelaugh", 
  "PepeLmfaoooo", "pepelove", "pepeplant", "peperun", "PepeYAYRunning", "SearchingPepe", 
  "Wankge"
];

async function seedEmojis() {
  try {
    await sequelize.sync();

    // Buscar todos os posts para popular emojis
    const posts = await Free.findAll();

    if (posts.length === 0) {
      console.log("Nenhum post encontrado. Crie pelo menos um conteúdo para popular os emojis.");
      return process.exit();
    }

    for (const post of posts) {
      for (const name of emojiList) {
        await Emojis.findOrCreate({
          where: { name, linkId: post.id },
          defaults: { count: 0 } // Começa com 0 reações
        });
      }
    }

    console.log("Emojis populados com sucesso para cada post!");
    process.exit();
  } catch (err) {
    console.error("Erro ao popular emojis:", err);
    process.exit(1);
  }
}

seedEmojis();
