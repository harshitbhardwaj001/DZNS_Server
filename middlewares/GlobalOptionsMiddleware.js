export const globalOptionsMiddleware = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Handle OPTIONS requests globally
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204); // No content for preflight requests
  } else {
    next(); // Continue with other routes
  }
};
