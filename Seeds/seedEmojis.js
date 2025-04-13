// seedEmojis.js
const { Emojis } = require('../models');
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
  await sequelize.sync(); 
  for (const name of emojiList) {
    await Emojis.findOrCreate({ where: { name } });
  }
  console.log("Emojis populados com sucesso!");
  process.exit();
}

seedEmojis();
