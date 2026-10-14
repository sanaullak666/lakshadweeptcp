import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/initDb';
import submissionRoutes from './routes/submissionRoutes';
import adminRoutes from './routes/adminRoutes';
import templateRoutes from './routes/templateRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for rendering PDF/preview frames
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev, or specify allowed
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsers (10MB limit for base64 signature image canvas payloads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serverless database initialization middleware (lazy cold-start init)
let isDbInitialized = false;
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  if (!isDbInitialized) {
    try {
      await initializeDatabase();
      isDbInitialized = true;
    } catch (error) {
      console.error('[DB Init Error in Serverless]:', error);
    }
  }
  next();
});

// URL Normalizer for Vercel Serverless
app.use((req: Request, _res: Response, next: NextFunction) => {
  const forwarded = (req.headers['x-forwarded-uri'] as string) || (req.headers['x-matched-path'] as string);
  if (forwarded && typeof forwarded === 'string' && forwarded.startsWith('/api')) {
    req.url = forwarded;
  } else if (req.url.startsWith('/api/index.ts')) {
    req.url = req.url.replace('/api/index.ts', '') || '/';
  }
  next();
});

// Static uploads serving
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check
app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Lakshadweep Objections Portal API'
  });
});

// API Routes (mount on both /api/* and root /* for flexible serverless rewrites)
app.use('/api/submissions', submissionRoutes);
app.use('/submissions', submissionRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/templates', templateRoutes);
app.use('/templates', templateRoutes);

// Fallback JSON 404 for API endpoints
app.all(['/api', '/api/*'], (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl || req.url}`
  });
});

// Serve frontend static build if available
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Centralized Error Handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error Handler]:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected internal error occurred.';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { debug: err.stack } : {})
  });
});

// Start Server and Initialize Database (for traditional long-running instances)
async function startServer() {
  try {
    await initializeDatabase();
    isDbInitialized = true;
    app.listen(PORT, () => {
      console.log(`[Server] Lakshadweep Objections Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server Init Error]: Failed to initialize database and start server:', error);
    process.exit(1);
  }
}

if (process.env.VERCEL !== '1' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}

export { app, startServer };
export default app;
