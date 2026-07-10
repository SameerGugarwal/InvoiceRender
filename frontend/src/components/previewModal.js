import { appState } from '../state/store.js';
import { fetchPreviewHtmlAPI } from '../services/api.js';

export async function openPreviewModal(templateType) {
  const modal = document.getElementById('preview-modal');
  const modalTitle = document.getElementById('modal-title');
  const iframe = document.getElementById('preview-iframe');

  const titles = {
    edf: 'EDF Electricity Bill – Live Preview',
    kenya_power: 'Kenya Power Bill – Live Preview',
    nicosia: 'Water Board Nicosia Bill – Live Preview',
  };

  modalTitle.textContent = titles[templateType] || 'Preview';
  
  // Show loading state in iframe
  iframe.srcdoc = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#666;">
      Generating live preview...
    </div>
  `;
  
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  try {
    // Send the current form state (appState) to the backend for preview
    const rawHtml = await fetchPreviewHtmlAPI(appState);
    
    // Set iframe content directly to the backend-injected HTML
    iframe.srcdoc = rawHtml;
  } catch (err) {
    iframe.srcdoc = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:red;">
        Error loading template: ${err.message}. Is the backend running?
      </div>
    `;
  }
}

export function initPreviewModal() {
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePreviewModal);
  }
  
  const modal = document.getElementById('preview-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePreviewModal();
    });
  }
}

function closePreviewModal() {
  const modal = document.getElementById('preview-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}
