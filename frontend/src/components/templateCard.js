import { updateState } from '../state/store.js';
import { openPreviewModal } from './previewModal.js';

export function initTemplateCards() {
  const templateCards = document.querySelectorAll('.template-card');

  templateCards.forEach(card => {
    // Select Template
    card.addEventListener('click', (e) => {
      // Ignore clicks on the preview button
      if (e.target.closest('button')) return;
      
      const templateType = card.dataset.template;
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
