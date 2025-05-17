// middlewares/checkApiKey.js
require('dotenv').config();

const checkApiKey = (req, res, next) => {
  const key = req.headers['x-api-key'];

  if (!key || key !== process.env.VITE_FRONTEND_API_KEY) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  next();
};

module.exports = checkApiKey;
