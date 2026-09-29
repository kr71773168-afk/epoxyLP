import '@fontsource-variable/schibsted-grotesk';
import './styles/tokens.css';
import './styles/base.css';
import './styles/side.css';
import './styles/quiz.css';

import cfg from './calculator/pricing.config.js';
import { startQuiz } from './calculator/quiz.js';
import { startBundbar } from './bundbar.js';
import { startSamtykke } from './consent.js';
import { startLead } from './lead-form.js';
import { track } from './tracking.js';
import { startVideo } from './video.js';

// ?kladde=0 skjuler pladsholder-markeringerne, fx til skærmbilleder
if (new URLSearchParams(window.location.search).get('kladde') === '0') {
  document.documentElement.classList.remove('kladde');
}

// Tiderne i "Sådan foregår det" kommer fra config, så de kun skal rettes ét sted
document.querySelectorAll('[data-tid]').forEach((el) => {
  if (cfg.tid[el.dataset.tid]) el.textContent = cfg.tid[el.dataset.tid];
});

const samtykke = startSamtykke();
const beregner = startQuiz();
startLead({ beregner, samtykke });
startBundbar(beregner);
startVideo();

document.addEventListener('click', (e) => {
  if (e.target.closest('a[href^="tel:"]')) track('Contact', { kilde: 'telefon' });
});
