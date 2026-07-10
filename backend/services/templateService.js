import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const TEMPLATE_FILES = {
  edf: 'EDF Electricity Bill.html',
  kenya_power: 'Kenya Power Bill.html',
  nicosia: 'Water Board Nicosia Bill.html',
};

/**
 * Returns the raw HTML string (used for the frontend preview modal)
 */
export function getRawTemplateHTML(templateType) {
  const templateFile = TEMPLATE_FILES[templateType];
  if (!templateFile) {
    const err = new Error(`Unknown template type: ${templateType}`);
    err.status = 404;
    throw err;
  }

  const templatePath = path.resolve(__dirname, '..', 'templates', templateFile);

  if (!fs.existsSync(templatePath)) {
    const fallbackPath = path.resolve(__dirname, '..', '..', 'doc', 'templets', templateFile);
    if (!fs.existsSync(fallbackPath)) {
        const err = new Error(`Template file not found at ${templatePath} or ${fallbackPath}`);
        err.status = 500;
        throw err;
    }
    return fs.readFileSync(fallbackPath, 'utf8');
  }

  return fs.readFileSync(templatePath, 'utf8');
}
