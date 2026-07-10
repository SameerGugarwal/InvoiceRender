const fs = require('fs');

// Patch store.js
let storeContent = fs.readFileSync('src/state/store.js', 'utf8');
if (!storeContent.includes('export function getState')) {
    storeContent += '\nexport function getState() {\n  return appState;\n}\n';
    fs.writeFileSync('src/state/store.js', storeContent);
}

// Patch main.js
let mainContent = fs.readFileSync('src/main.js', 'utf8');
mainContent = mainContent.replace(
    /import \{ appState, subscribe, updateState \} from '.\/state\/store.js';/,
    "import { appState, subscribe, updateState, getState } from './state/store.js';"
);
mainContent = mainContent.replace(
    /const blob = await generatePdfAPI\(appState\);/g,
    "const blob = await generatePdfAPI(getState());"
);
fs.writeFileSync('src/main.js', mainContent);

// Patch previewModal.js
let previewContent = fs.readFileSync('src/components/previewModal.js', 'utf8');
previewContent = previewContent.replace(
    /import \{ appState \} from '\.\.\/state\/store.js';/,
    "import { appState, getState } from '../state/store.js';"
);
previewContent = previewContent.replace(
    /const rawHtml = await fetchPreviewHtmlAPI\(appState\);/g,
    "const rawHtml = await fetchPreviewHtmlAPI(getState());"
);
fs.writeFileSync('src/components/previewModal.js', previewContent);
