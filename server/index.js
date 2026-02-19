import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SakhiSahyog AI Server is running',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SakhiSahyog AI Backend',
    endpoints: {
      chat: '/api/chat',
      health: '/api/health',
      context: '/api/chat/context'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🌸 SakhiSahyog AI Backend Server 🌸                    ║
║                                                            ║
║     Server running on http://localhost:${PORT}              ║
║                                                            ║
║     Available endpoints:                                   ║
║     • POST /api/chat          - Send message to AI         ║
║     • GET  /api/chat/history/:id - Get conversation        ║
║     • GET  /api/chat/context  - Get SHG context            ║
║     • GET  /api/health        - Health check               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
