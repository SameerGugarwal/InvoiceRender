import Handlebars from 'handlebars';
import { getRawTemplateHTML } from '../templateService.js';

export function injectKenyaPower(payload) {
  const rawHtml = getRawTemplateHTML('kenya_power');
  
  const template = Handlebars.compile(rawHtml);
  return template(payload);
}
