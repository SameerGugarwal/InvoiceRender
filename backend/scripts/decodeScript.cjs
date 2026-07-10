const fs = require('fs');
const zlib = require('zlib');

const html = fs.readFileSync('../../doc/templets/EDF Electricity Bill.html', 'utf8');
const match = html.match(/<script type="__bundler\/manifest">([\s\S]*?)<\/script>/);
if (match) {
    const manifest = JSON.parse(match[1].trim());
    const entry = manifest['496ab745-4fd9-44ea-a882-1f2050841019'];
    if (entry) {
        const buffer = Buffer.from(entry.data, 'base64');
        if (entry.compressed) {
            const decompressed = zlib.gunzipSync(buffer);
            console.log("Script content:");
            console.log(decompressed.toString('utf8').substring(0, 2000));
        } else {
            console.log(buffer.toString('utf8'));
        }
    }
}
