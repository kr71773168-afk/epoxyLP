import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/sections.css';
import './styles/calculator.css';

import { startBeregner } from './calculator/ui.js';
import { startSamtykke } from './consent.js';
import { startFoerEfter } from './effects/before-after.js';
import { startNiveaulinjer } from './effects/level-lines.js';
import { startHero } from './hero.js';
import { startLead } from './lead-form.js';
import { track } from './tracking.js';

// ?kladde=0 skjuler pladsholder-markeringerne, fx til skærmbilleder
if (new URLSearchParams(window.location.search).get('kladde') === '0') {
  document.documentElement.classList.remove('kladde');
}

const samtykke = startSamtykke();
const beregner = startBeregner();
startHero({ beregner });
startLead({ beregner, samtykke });
startNiveaulinjer();
startFoerEfter(document.querySelector('[data-foerefter]'));

document.addEventListener('click', (e) => {
  if (e.target.closest('a[href^="tel:"]')) track('Contact', { kilde: 'telefon' });
});
