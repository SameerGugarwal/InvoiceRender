const fs = require('fs');
const zlib = require('zlib');

function extractDecompressed(file) {
  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(/"data":"([^"]+)"/g);
  if (match) {
    match.forEach(m => {
      const base64 = m.replace('"data":"', '').replace('"', '');
      try {
        const buffer = Buffer.from(base64, 'base64');
        const unzipped = zlib.gunzipSync(buffer).toString('utf8');
        if (unzipped.includes('<html') || unzipped.includes('<div')) {
           console.log('--- ' + file + ' ---');
           const textMatches = unzipped.match(/>([^<]+)<\/div>/g);
           if (textMatches) {
             console.log(textMatches.map(t => t.replace(/<[^>]+>/g, '').trim()).filter(t => t.length > 2).slice(10, 60));
           }
        }
      } catch(e) {}
    });
  }
}

extractDecompressed('doc/templets/EDF Electricity Bill.html');
