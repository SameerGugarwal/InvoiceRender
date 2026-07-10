import Handlebars from 'handlebars';
import { getRawTemplateHTML } from '../templateService.js';

export function injectNicosia(payload) {
  const rawHtml = getRawTemplateHTML('nicosia');
  
  const template = Handlebars.compile(rawHtml);
  return template(payload);
}
