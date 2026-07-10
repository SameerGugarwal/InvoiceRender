import Handlebars from 'handlebars';
import { getRawTemplateHTML } from '../templateService.js';

export function injectNicosia(payload) {
  const rawHtml = getRawTemplateHTML('nicosia');
  
  console.log("Compiling Nicosia with payload:", JSON.stringify(payload, null, 2));

  const template = Handlebars.compile(rawHtml);
  return template(payload);
}
