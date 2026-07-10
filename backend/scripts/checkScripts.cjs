const fs = require('fs');

const html = fs.readFileSync('../../doc/templets/EDF Electricity Bill.html', 'utf8');
const match = html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
if (match) {
    const templateStr = JSON.parse(match[1].trim());
    const scripts = templateStr.match(/<script[\s\S]*?<\/script>/g);
    console.log(scripts);
}
