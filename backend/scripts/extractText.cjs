const fs = require('fs');

function extractAndPrintText(filename) {
    const html = fs.readFileSync(filename, 'utf8');
    const match = html.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
    if (match) {
        try {
            const templateStr = JSON.parse(match[1].trim());
            // just print text content using regex to strip HTML tags
            const textOnly = templateStr.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            console.log("Text in " + filename + ":");
            console.log(textOnly.substring(0, 1000));
        } catch (e) {
            console.error("Parse failed for " + filename, e);
        }
    }
}

extractAndPrintText('../../doc/templets/Kenya Power Bill.html');
extractAndPrintText('../../doc/templets/Water Board Nicosia Bill.html');
