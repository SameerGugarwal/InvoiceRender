import './style.css';
import { appState, subscribe, updateState, getState } from './state/store.js';
import { initGlobalForm, updateGenerateButton } from './components/globalForm.js';
import { initTemplateCards, updateTemplateCardSelection } from './components/templateCard.js';
import { updateDynamicFormVisibility } from './components/dynamicForm.js';
import { initPreviewModal } from './components/previewModal.js';
import { validateAll } from './services/validator.js';
import { generatePdfAPI } from './services/api.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI Components
  initGlobalForm();
  initTemplateCards();
  initPreviewModal();

  // Restore state to UI from localStorage
  Object.keys(appState).forEach(key => {
    if (key !== 'template_type') {
      const input = document.getElementById(key);
      if (input) {
        input.value = appState[key];
      }
    }
  });

  // Trigger initial UI updates for the loaded state
  updateTemplateCardSelection(appState);
  updateDynamicFormVisibility(appState);
  updateGenerateButton(appState);

  // Subscribe components to state changes. Only scroll to the conditional
  // section when the selected template actually changes — otherwise every
  // keystroke would yank the page back up/down to that section.
  let lastTemplateType = appState.template_type;
  subscribe((state) => {
    const templateChanged = state.template_type !== lastTemplateType;
    lastTemplateType = state.template_type;
    updateTemplateCardSelection(state);
    updateDynamicFormVisibility(state, templateChanged);
    updateGenerateButton(state);
  });

  // Handle Form Submission (PDF Generation)
  const generateBtn = document.getElementById('generate-btn');
  const errorContainer = document.getElementById('error-container');
  const errorList = document.getElementById('error-list');

  generateBtn.addEventListener('click', async () => {
    // Hide previous errors
    errorContainer.classList.add('hidden');
    errorList.innerHTML = '';

    // Validate
    const errors = validateAll();
    if (errors.length > 0) {
      errors.forEach(err => {
        const li = document.createElement('li');
        li.textContent = err;
        errorList.appendChild(li);
      });
      errorContainer.classList.remove('hidden');
      errorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Set Loading State
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Generating PDF...
    `;
    generateBtn.disabled = true;

    try {
      // API Call
      const blob = await generatePdfAPI(getState());
      
      // Download File
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${getState().template_type}_invoice.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Error generating PDF:', error);
      const li = document.createElement('li');
      li.textContent = `Server Error: ${error.message}`;
      errorList.appendChild(li);
      errorContainer.classList.remove('hidden');
    } finally {
      // Restore Button State
      generateBtn.innerHTML = originalText;
      generateBtn.disabled = false;
    }
  });
});
