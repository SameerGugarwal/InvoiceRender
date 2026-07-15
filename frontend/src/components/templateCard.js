import { updateState, updateStateBulk, getState, TEMPLATE_DEFAULTS } from '../state/store.js';
import { clearFieldError } from '../services/validator.js';
import { openPreviewModal } from './previewModal.js';

// Push a template's constant fields into both the inputs and the state. Runs
// only on an actual template switch, so re-clicking the selected card can't
// silently discard edits the user made to a defaulted field.
function applyTemplateDefaults(templateType) {
  const defaults = TEMPLATE_DEFAULTS[templateType];
  if (!defaults) return;

  Object.entries(defaults).forEach(([field, value]) => {
    const input = document.getElementById(field);
    if (input) {
      input.value = value;
      clearFieldError(input);
    }
  });

  updateStateBulk(defaults);
}

export function initTemplateCards() {
  const templateCards = document.querySelectorAll('.template-card');

  templateCards.forEach(card => {
    // Select Template
    card.addEventListener('click', (e) => {
      // Ignore clicks on the preview button
      if (e.target.closest('button')) return;

      const templateType = card.dataset.template;
      if (templateType === getState().template_type) return;

      applyTemplateDefaults(templateType);
      updateState('template_type', templateType);
    });

    // Preview Button
    const previewBtn = card.querySelector('button');
    if (previewBtn) {
      previewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const templateType = card.dataset.template;
        openPreviewModal(templateType);
      });
    }
  });
}

export function updateTemplateCardSelection(appState) {
  document.querySelectorAll('.template-card').forEach(card => {
    card.classList.toggle('active', card.dataset.template === appState.template_type);
  });
}
