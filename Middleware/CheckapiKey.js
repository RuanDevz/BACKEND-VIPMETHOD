module.exports = function checkApiKey(req, res, next) {
  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const apiKey = req.headers['x-api-key'];
  const adminKey = req.headers['x-admin-key'];

  const allowedApiKey = process.env.VITE_FRONTEND_API_KEY;
  const allowedAdminKey = process.env.ADMIN_API_KEY;

  const allowedOrigins = [
    'https://sevenxleaks.com',
    'http://localhost:5173',
  ];

  const isAllowedOrigin =
    allowedOrigins.includes(origin) ||
    allowedOrigins.some(o => referer?.startsWith(o));

  // ✅ Se for admin com chave correta → libera tudo
  if (adminKey && adminKey === allowedAdminKey) {
    return next();
  }

  // ✅ Se for GET com origem confiável + chave do frontend → libera
  if (req.method === 'GET' && apiKey === allowedApiKey && isAllowedOrigin) {
    return next();
  }

  // ❌ Bloqueia o resto
  return res.status(403).json({ error: 'Unauthorized access' });
};
