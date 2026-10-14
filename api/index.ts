import app from '../backend/src/server';

export default function handler(req: any, res: any) {
  const forwardedUri = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
  if (forwardedUri && typeof forwardedUri === 'string' && forwardedUri.startsWith('/api')) {
    req.url = forwardedUri;
  } else if (req.query && req.query.__path) {
    const queryPart = req.url.includes('?') ? '?' + req.url.split('?')[1].replace(/__path=[^&]*&?/, '').replace(/&$/, '') : '';
    req.url = `/api/${req.query.__path}${queryPart === '?' ? '' : queryPart}`;
  } else if (req.url && req.url.includes('__path=')) {
    const match = req.url.match(/__path=([^&]+)/);
    if (match && match[1]) {
      req.url = `/api/${decodeURIComponent(match[1])}`;
    }
  }
  return app(req, res);
}

export { app };
