import { Router } from 'express';
import { handleGeneratePdf, handleGetTemplate, handlePreviewHtml } from '../controllers/pdfController.js';

const router = Router();

router.post('/generate-pdf', handleGeneratePdf);
router.post('/preview-html', handlePreviewHtml);
router.get('/templates/:name', handleGetTemplate);

export default router;
