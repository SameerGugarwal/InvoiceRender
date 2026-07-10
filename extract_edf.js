const fs = require('fs');
const html = fs.readFileSync('doc/templets/EDF Electricity Bill.html', 'utf8');
const match = html.match(/<div[^>]*>([^<]+)<\/div>/g);
if (match) {
  const texts = match.map(m => m.replace(/<[^>]+>/g, '').trim()).filter(t => t.length > 2);
  console.log(texts.slice(20, 100).join('\n'));
}
