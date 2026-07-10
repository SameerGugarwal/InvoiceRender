import Handlebars from 'handlebars';
import { getRawTemplateHTML } from '../templateService.js';

export function injectKenyaPower(payload) {
  const rawHtml = getRawTemplateHTML('kenya_power');
  
  console.log("Compiling Kenya Power with payload:", JSON.stringify(payload, null, 2));

  const template = Handlebars.compile(rawHtml);
  return template(payload);
}
