import { updateState, updateStateBulk, getState, getTemplateDefaults } from '../state/store.js';
import { clearFieldError } from '../services/validator.js';
import { openPreviewModal } from './previewModal.js';

// Fill the form with a template's defaults, dates included, so the bill can be
// generated after changing nothing but the name. Runs only on an actual template
// switch, so re-clicking the selected card can't silently discard edits.
export function applyTemplateDefaults(templateType) {
  // Resolved against today, every time — never a stale literal.
  const defaults = getTemplateDefaults(templateType);
  if (!defaults) return;

  writeFields(defaults);
  updateStateBulk(defaults);
}

/** Mirrors state values into their inputs, clearing any stale error styling. */
export function writeFields(values) {
  Object.entries(values).forEach(([field, value]) => {
    const input = document.getElementById(field);
    if (input) {
      input.value = value;
      clearFieldError(input);
    }
  });
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
