import app from '../server/src/server.js';

// Vercel serverless function entry point
// This wraps the Express app for Vercel's serverless runtime
export default function handler(req, res) {
  // If Vercel rewrite forwarded request as /api/index.js, restore original URL path
  if (req.url === '/api/index.js' || req.url.startsWith('/api/index.js')) {
    const originalUrl = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
    if (originalUrl && originalUrl !== '/api/index.js') {
      req.url = originalUrl;
    }
  }
  return app(req, res);
}

