import Handlebars from 'handlebars';
import { getRawTemplateHTML } from '../templateService.js';

export function injectEDF(payload) {
  const rawHtml = getRawTemplateHTML('edf');
  
  const template = Handlebars.compile(rawHtml);
  return template(payload);
}
