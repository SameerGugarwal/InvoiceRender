const fs = require('fs');
const path = require('path');

function removeReactScript(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    const match = html.match(/(<script type="__bundler\/template">)([\s\S]*?)(<\/script>)/);
    if (match) {
        let templateStr = JSON.parse(match[2].trim());
        // Remove all script tags from the template string
        templateStr = templateStr.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        const newHtml = html.substring(0, match.index) + 
                        match[1] + 
                        JSON.stringify(templateStr) + 
                        match[3] + 
                        html.substring(match.index + match[0].length);
        fs.writeFileSync(filePath, newHtml, 'utf8');
        console.log(`Successfully removed script tags from ${filePath}`);
    }
}

removeReactScript('../../doc/templets/EDF Electricity Bill.html');
removeReactScript('../../backend/templates/EDF Electricity Bill.html');
