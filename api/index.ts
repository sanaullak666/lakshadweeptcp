import app from '../backend/src/server';

export default function handler(req: any, res: any) {
  const forwardedUri = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
  if (forwardedUri && typeof forwardedUri === 'string' && forwardedUri.startsWith('/api')) {
    req.url = forwardedUri;
  }
  return app(req, res);
}

export { app };
