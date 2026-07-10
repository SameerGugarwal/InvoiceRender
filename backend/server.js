import express from 'express';
import cors from 'cors';
import pdfRoutes from './routes/pdfRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Local frontend
    'https://invoicerender-frontend.onrender.com/' // Live frontend URL
  ],
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
