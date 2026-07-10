import { updateState } from '../state/store.js';
import { validateField } from '../services/validator.js';

export function initGlobalForm() {
  const inputs = document.querySelectorAll('input, select');
  
  inputs.forEach(input => {
    // Validate on blur
    input.addEventListener('blur', () => {
      validateField(input);
    });

    // Clear error and update state on input
    const updateHandler = (e) => {
      const id = e.target.id;
      if (id) {
        updateState(id, e.target.value);
        if (input.classList.contains('error')) {
          validateField(input);
        }
      }
    };
    input.addEventListener('input', updateHandler);
    input.addEventListener('change', updateHandler);
    // Old listener replaced
  });
}

export function updateGenerateButton(appState) {
  const generateBtn = document.getElementById('generate-btn');
  if (appState.template_type) {
    generateBtn.disabled = false;
    generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    generateBtn.classList.add('hover:-translate-y-1', 'hover:shadow-lg', 'hover:shadow-primary/30');
  } else {
    generateBtn.disabled = true;
    generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
    generateBtn.classList.remove('hover:-translate-y-1', 'hover:shadow-lg', 'hover:shadow-primary/30');
  }
}
