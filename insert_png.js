const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'doc/templets/nicosia_water_bill.html');
const imgPath = path.join(__dirname, 'doc/LOGOS/Water Board of Nicosia/Screenshot 2026-07-15 at 1.40.06 PM.png');

if (!fs.existsSync(imgPath)) {
    console.error("Image file not found:", imgPath);
    process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');
let imgContent = fs.readFileSync(imgPath);
let base64Img = imgContent.toString('base64');
let dataUri = `data:image/png;base64,${base64Img}`;

let htmlToInsert = `
                    <div style=" position: absolute; overflow: hidden; top: 800px; right: 10px;">
                        <img src="${dataUri}"
                            style="width: 180px; height: 100px; object-fit: contain;">
                    </div>
`;

let targetLine = `                    <div style=" position: absolute; overflow: hidden; top: 840px;">`;

if (html.includes(targetLine)) {
    html = html.replace(targetLine, htmlToInsert + targetLine);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log("Successfully inserted base64 image block.");
} else {
    console.log("Could not find the target line to insert before.");
    process.exit(1);
}
