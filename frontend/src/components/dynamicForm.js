export function updateDynamicFormVisibility(appState) {
  const templateType = appState.template_type;
  if (!templateType) return;

  const meterSection = document.getElementById('meter-section');
  const edfSection = document.getElementById('edf-section');
  const kenyaSection = document.getElementById('kenya-section');
  const nicosiaSection = document.getElementById('nicosia-section');

  // Reset all
  if (meterSection) meterSection.classList.remove('visible');
  if (edfSection) edfSection.classList.remove('visible');
  if (kenyaSection) kenyaSection.classList.remove('visible');
  if (nicosiaSection) nicosiaSection.classList.remove('visible');

  // Show relevant sections
  if (templateType === 'edf') {
    if (edfSection) edfSection.classList.add('visible');
  } else if (templateType === 'kenya_power') {
    if (meterSection) meterSection.classList.add('visible');
    if (kenyaSection) kenyaSection.classList.add('visible');
  } else if (templateType === 'nicosia') {
    if (meterSection) meterSection.classList.add('visible');
    if (nicosiaSection) nicosiaSection.classList.add('visible');
  }

  // Smooth scroll to conditional section
  setTimeout(() => {
    const targetSection = templateType === 'edf' ? edfSection : meterSection;
    if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 350);
}
