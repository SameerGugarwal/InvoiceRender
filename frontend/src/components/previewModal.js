import { getState, DUMMY_DATA } from '../state/store.js';
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
    // Preview the clicked template with the current form state,
    // falling back to dummy data for any fields left empty
    const previewState = { ...(DUMMY_DATA[templateType] || {}) };
    const currentState = getState();
    Object.keys(currentState).forEach(key => {
      const value = currentState[key];
      if (typeof value === 'string' ? value.trim() !== '' : value != null) {
        previewState[key] = value;
      }
    });
    previewState.template_type = templateType;

    const rawHtml = await fetchPreviewHtmlAPI(previewState);
    
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
