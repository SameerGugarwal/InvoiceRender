import fs from 'fs';
fetch('http://localhost:3000/api/generate-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ template_type: 'edf' })
}).then(res => res.arrayBuffer()).then(buffer => {
  fs.writeFileSync('test.pdf', Buffer.from(buffer));
  console.log('PDF saved, size:', buffer.byteLength);
}).catch(console.error);
