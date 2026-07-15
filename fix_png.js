const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'doc/templets/nicosia_water_bill.html');
const imgPath = path.join(__dirname, 'doc/LOGOS/Water Board of Nicosia/Screenshot 2026-07-15 at 1.40.06 PM.png');

let html = fs.readFileSync(htmlPath, 'utf8');
let imgContent = fs.readFileSync(imgPath);
let base64Img = imgContent.toString('base64');
let dataUri = `data:image/png;base64,${base64Img}`;

let htmlToInsert = `
    <!-- ABSOLUTE INJECTED -->
    <div style="position: absolute; z-index: 100; overflow: hidden; top: 800px; right: 10px;">
        <img src="${dataUri}"
             style="width: 180px; height: 100px; object-fit: contain;">
    </div>
`;

// Remove the mistakenly added blocks using regex to wipe them out completely
const regex = /<div style=" position: absolute; overflow: hidden; top: 800px; right: 10px;">[\s\S]*?<\/div>\s*/g;
html = html.replace(regex, '');

// Remove any prior injection with the new comment
const injectedRegex = /<!-- ABSOLUTE INJECTED -->[\s\S]*?<\/div>\s*/g;
html = html.replace(injectedRegex, '');

// Insert just after the <!-- ===== HEADER ===== --> comment
const targetPoint = `<!-- ===== HEADER ===== -->`;

if (html.includes(targetPoint)) {
    html = html.replace(targetPoint, targetPoint + '\n' + htmlToInsert);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log("Successfully fixed PNG block.");
} else {
    console.log("Could not find the target point to insert before.");
}
