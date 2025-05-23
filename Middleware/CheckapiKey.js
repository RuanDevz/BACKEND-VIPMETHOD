// middleware/checkApiKey.js
module.exports = function checkApiKey(req, res, next) {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const apiKey = req.headers['x-api-key'];

  const allowedApiKey = process.env.FRONTEND_API_KEY;
  const allowedOrigins = [
    'https://seudominio.com',
    'http://localhost:5173',
  ];

  const isAllowedOrigin =
    allowedOrigins.includes(origin) ||
    allowedOrigins.some(o => referer?.startsWith(o));

  if (apiKey !== allowedApiKey || !isAllowedOrigin) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  next();
};
