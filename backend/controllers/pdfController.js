import { generatePDF } from '../services/puppeteerService.js';
import { TEMPLATE_FILES } from '../services/templateService.js';
import { injectEDF } from '../services/templates/edfInjector.js';
import { injectKenyaPower } from '../services/templates/kenyaInjector.js';
import { injectNicosia } from '../services/templates/nicosiaInjector.js';

export const handleGeneratePdf = async (req, res, next) => {
  try {
    const payload = req.body;

    const validTemplates = Object.keys(TEMPLATE_FILES);
    if (!payload.template_type || !validTemplates.includes(payload.template_type)) {
      const err = new Error(`Invalid or missing template_type. Must be one of: ${validTemplates.join(', ')}`);
      err.status = 400;
      throw err;
    }

    console.log(`[PDF Controller] Generating ${payload.template_type} bill for: ${payload.customer_name || 'Unknown'}`);

    // Modular injection based on template type
    let htmlContent;
    switch (payload.template_type) {
      case 'edf':
        htmlContent = injectEDF(payload);
        break;
      case 'kenya_power':
        htmlContent = injectKenyaPower(payload);
        break;
      case 'nicosia':
        htmlContent = injectNicosia(payload);
        break;
      default:
        throw new Error('No injector configured for this template');
    }

    const pdfBuffer = await generatePDF(htmlContent);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${payload.template_type}_invoice.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

export const handleGetTemplate = (req, res, next) => {
  try {
    const name = req.params.name;
    const html = getRawTemplateHTML(name);
    res.send(html);
  } catch (err) {
    next(err);
  }
};

export const handlePreviewHtml = async (req, res, next) => {
  try {
    const payload = req.body;
    const validTemplates = Object.keys(TEMPLATE_FILES);
    if (!payload.template_type || !validTemplates.includes(payload.template_type)) {
      return res.status(400).json({ error: 'Invalid template_type' });
    }

    let htmlContent;
    switch (payload.template_type) {
      case 'edf': htmlContent = injectEDF(payload); break;
      case 'kenya_power': htmlContent = injectKenyaPower(payload); break;
      case 'nicosia': htmlContent = injectNicosia(payload); break;
      default: throw new Error('No injector');
    }

    res.send(htmlContent);
  } catch (err) {
    next(err);
  }
};
