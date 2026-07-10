const fs = require('fs');

function fixJsonEscape(filePath) {
    let html = fs.readFileSync(filePath, 'utf8');
    const match = html.match(/(<script type="__bundler\/template">)([\s\S]*?)(<\/script>)/);
    if (match) {
        try {
            // First try to parse it. It should parse fine in Node.js because Node doesn't care about HTML tags closing it.
            let templateStr = JSON.parse(match[2].trim());
            // Now stringify it and escape `<` to prevent the browser from seeing `</script>`
            let escapedJson = JSON.stringify(templateStr).replace(/</g, '\\u003c');
            
            const newHtml = html.substring(0, match.index) + 
                            match[1] + 
                            escapedJson + 
                            match[3] + 
                            html.substring(match.index + match[0].length);
                            
            fs.writeFileSync(filePath, newHtml, 'utf8');
            console.log(`Successfully fixed JSON escaping in ${filePath}`);
        } catch(e) {
            console.log(`Error parsing JSON in ${filePath}`, e);
        }
    }
}

fixJsonEscape('../../doc/templets/EDF Electricity Bill.html');
fixJsonEscape('../../backend/templates/EDF Electricity Bill.html');
fixJsonEscape('../../doc/templets/Kenya Power Bill.html');
fixJsonEscape('../../backend/templates/Kenya Power Bill.html');
fixJsonEscape('../../doc/templets/Water Board Nicosia Bill.html');
fixJsonEscape('../../backend/templates/Water Board Nicosia Bill.html');
