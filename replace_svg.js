const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'doc/templets/nicosia_water_bill.html');
const svgPath = path.join(__dirname, 'doc/LOGOS/Water Board of Nicosia/Screenshot 2026-07-13 at 5.05.31 PM.svg');

if (!fs.existsSync(svgPath)) {
    console.error("SVG file not found:", svgPath);
    process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');
let svgContent = fs.readFileSync(svgPath, 'utf8');

let base64Svg = Buffer.from(svgContent).toString('base64');
let dataUri = `data:image/svg+xml;base64,${base64Svg}`;

let targetStr = `"doc/LOGOS/Water Board of Nicosia/Screenshot 2026-07-13 at 5.05.31 PM.svg"`;
let replaceStr = `"${dataUri}"`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, replaceStr);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log("Successfully replaced image with base64.");
} else {
    console.log("Target string not found in HTML.");
}
