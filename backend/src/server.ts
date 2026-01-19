import dotenv from 'dotenv';
// Load environment variables FIRST before anything else
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
// Import sequelize from TypeScript file
import sequelize from './config/database';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware - configure Helmet to allow iframe embedding for static files
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  frameguard: false, // Disable frameguard globally, we'll set it per route
  contentSecurityPolicy: false, // Disable CSP globally, we'll set it per route
}));

// Re-enable frameguard for non-static routes only
app.use((req, res, next) => {
  // Only apply frameguard to non-static routes
  if (!req.path.startsWith('/uploads')) {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  }
  next();
});
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files (attachments) with CORS headers
// IMPORTANT: This must come BEFORE Helmet's frameguard middleware
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for static files
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  // CRITICAL: Remove X-Frame-Options to allow iframe embedding
  res.removeHeader('X-Frame-Options');
  // Set permissive CSP for iframe embedding
  const cspOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  res.setHeader('Content-Security-Policy', `frame-ancestors 'self' ${cspOrigin}`);
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    // Set proper content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      // CRITICAL: Remove X-Frame-Options to allow PDF embedding in iframes
      res.removeHeader('X-Frame-Options');
      // Set permissive CSP
      const cspOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
      res.setHeader('Content-Security-Policy', `frame-ancestors 'self' ${cspOrigin}`);
    } else if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      res.setHeader('Content-Type', `image/${ext.slice(1)}`);
      res.removeHeader('X-Frame-Options');
    } else if (['.doc', '.docx'].includes(ext)) {
      res.removeHeader('X-Frame-Options');
      const cspOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
      res.setHeader('Content-Security-Policy', `frame-ancestors 'self' ${cspOrigin}`);
    }
  },
}));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes will be added after models are loaded

// Error handling
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // First, authenticate the database connection
    // This ensures the Sequelize instance is fully ready
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // CRITICAL: Import models BEFORE routes
    // Routes import controllers, which import models
    // Models must be loaded after sequelize.authenticate() but before routes
    await import('./models');
    console.log('Models loaded successfully.');

    // Now import routes - controllers can safely use models now
    const routes = (await import('./routes')).default;
    app.use('/api/v1', routes);
    console.log('Routes loaded successfully.');

    // Sync models (only in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Database models synchronized.');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

