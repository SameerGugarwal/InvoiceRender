import express from 'express';
import cors from 'cors';
import pdfRoutes from './routes/pdfRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  'http://localhost:5173', // Local frontend
  'https://invoicerender-frontend.onrender.com/' // Live frontend URL
];

app.use(cors({
  // Browsers send the Origin header without a trailing slash;
  // normalize both sides so a stray "/" in the list can't break CORS
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // curl, server-to-server, health checks
    const normalized = origin.replace(/\/+$/, '');
    callback(null, allowedOrigins.some(o => o.replace(/\/+$/, '') === normalized));
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', pdfRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] InvoiceRender API running on http://localhost:${PORT}`);
});
