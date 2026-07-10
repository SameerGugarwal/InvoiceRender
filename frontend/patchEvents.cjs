const fs = require('fs');
let content = fs.readFileSync('src/components/globalForm.js', 'utf8');

// Replace the event listener attachment to also include 'change'
content = content.replace(
  "input.addEventListener('input', (e) => {",
  "const updateHandler = (e) => {\n      const id = e.target.id;\n      if (id) {\n        updateState(id, e.target.value);\n        if (input.classList.contains('error')) {\n          validateField(input);\n        }\n      }\n    };\n    input.addEventListener('input', updateHandler);\n    input.addEventListener('change', updateHandler);\n    // Removed old input listener start: "
);

// We need to clean up the old listener body
content = content.replace(
  "// Removed old input listener start: \n      const id = e.target.id;\n      if (id) {\n        updateState(id, e.target.value);\n        if (input.classList.contains('error')) {\n          validateField(input); // re-validate to clear error early if fixed\n        }\n      }\n    });",
  "// Old listener replaced"
);

fs.writeFileSync('src/components/globalForm.js', content);
