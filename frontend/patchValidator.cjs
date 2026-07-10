const fs = require('fs');
let content = fs.readFileSync('src/services/validator.js', 'utf8');

// Replace import
content = content.replace(
    /import \{ appState \} from '\.\.\/state\/store\.js';/,
    "import { appState, getState } from '../state/store.js';"
);

// Replace all usages of appState in validateAll with getState()
content = content.replace(/appState/g, "getState()");

// Fix the import line which got replaced by getState() by replacing appState
content = content.replace(
    /import \{ getState\(\), getState \} from '\.\.\/state\/store\.js';/,
    "import { getState } from '../state/store.js';"
);

fs.writeFileSync('src/services/validator.js', content);
