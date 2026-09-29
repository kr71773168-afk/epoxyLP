import { FLAKE_BLANDING, nuance, rng } from '../effects/materials.js';

const NS = 'http://www.w3.org/2000/svg';

function element(navn, attr) {
  const el = document.createElementNS(NS, navn);
  for (const [k, v] of Object.entries(attr)) el.setAttribute(k, v);
  return el;
}

/**
 * Snittet gennem gulvet. Lagene bygges op, efterhånden som man svarer,
 * og listen under snittet forklarer, hvad man betaler for.
 */
export function startSnit({ svg, holder, liste, cfg }) {
  const $ = (id) => svg.querySelector(id);

  const r1 = rng(3);
  const tilslag = $('#snit-tilslag');
  for (let i = 0; i < 95; i++) {
    tilslag.appendChild(element('circle', {
      cx: (r1() * 640).toFixed(1),
      cy: (133 + r1() * 63).toFixed(1),
      r: (0.9 + r1() * 2.6).toFixed(1),
      ...(r1() > 0.6 ? { class: 'lys' } : {}),
    }));
  }

  let slib = 'M0 127.6';
  for (let x = 4; x <= 600; x += 4) slib += ` L${x} ${(x / 4) % 2 ? 126.2 : 127.8}`;
  $('#snit-slib').setAttribute('d', slib);

  const r2 = rng(5);
  const flakes = $('#snit-flakes');
  for (let i = 0; i < 120; i++) {
    flakes.appendChild(element('rect', {
      x: (r2() * 592).toFixed(1),
      y: (93 + r2() * 11).toFixed(1),
      width: (3 + r2() * 5).toFixed(1),
      height: (1.4 + r2() * 1.4).toFixed(1),
      fill: FLAKE_BLANDING[(r2() * FLAKE_BLANDING.length) | 0],
    }));
  }

  const r3 = rng(8);
  const sand = $('#snit-sand');
  for (let i = 0; i < 140; i++) {
    sand.appendChild(element('circle', { cx: (r3() * 590).toFixed(1), cy: (88.6 + r3() * 1.6).toFixed(1), r: (0.7 + r3() * 0.9).toFixed(1) }));
  }

  const lagNavne = ['toplak', 'skridsikker', 'flakes', 'metallic', 'grundlag', 'primer', 'forbehandling', 'hulkehl'];
  const lagInfo = {
    ...cfg.lag,
    skridsikker: { navn: 'Skridsikring', beskrivelse: 'Kvartssand i toplaget', mm: '' },
    hulkehl: { navn: 'Hulkehl', beskrivelse: '', mm: '' },
  };
  liste.innerHTML = lagNavne.map((k) => `
    <li data-lag="${k}" hidden>
      <i class="noegle noegle-${k}" aria-hidden="true"></i>
      <span>${lagInfo[k].navn}</span>
      <span class="desk">${lagInfo[k].beskrivelse}</span>
      <span class="mm">${lagInfo[k].mm}</span>
    </li>`).join('');
  const raekke = (k) => liste.querySelector(`[data-lag="${k}"]`);
  const desk = (k) => raekke(k).querySelector('.desk');

  const farveNavn = (kode) => cfg.farver.find((f) => f.kode === kode)?.navn.toLowerCase() ?? '';

  return {
    /** @param {object} svar  svar fra beregneren plus farve */
    opdater(svar, resultat) {
      const hex = cfg.farver.find((f) => f.kode === svar.farve)?.hex ?? '#9BA1A4';
      holder.style.setProperty('--grundlag', hex);
      holder.style.setProperty('--m1', nuance(hex, 0.35));
      holder.style.setProperty('--m2', nuance(hex, -0.35));
      holder.style.setProperty('--m3', nuance(hex, 0.7));
      holder.style.setProperty('--m4', nuance(hex, -0.6));

      const harOverflade = Boolean(svar.overflade);
      const standKendt = svar.stand && svar.stand !== 'vedikke';
      const tilvalg = svar.tilvalg;

      $('#snit-lag').style.opacity = harOverflade ? 1 : 0;
      $('#snit-flakes').style.opacity = svar.overflade === 'flakes' ? 1 : 0;
      $('#snit-metallic').style.opacity = svar.overflade === 'metallic' ? 1 : 0;
      $('#snit-sand').style.opacity = tilvalg?.includes('skridsikker') ? 1 : 0;
      $('#snit-revne').dataset.tilstand = svar.stand === 'revner' ? 'fyldt' : standKendt ? 'skjult' : 'maaske';
      $('#snit-hulkehl').dataset.tilstand = tilvalg === null ? 'maaske' : tilvalg.includes('hulkehl') ? 'fyldt' : 'skjult';

      for (const k of ['toplak', 'grundlag', 'primer']) raekke(k).hidden = !harOverflade;
      raekke('flakes').hidden = svar.overflade !== 'flakes';
      raekke('metallic').hidden = svar.overflade !== 'metallic';
      raekke('skridsikker').hidden = !tilvalg?.includes('skridsikker');
      raekke('forbehandling').hidden = false;
      raekke('hulkehl').hidden = !harOverflade || tilvalg === null || !tilvalg.includes('hulkehl');

      desk('grundlag').textContent = `${cfg.lag.grundlag.beskrivelse}, ${farveNavn(svar.farve)}`;
      desk('forbehandling').textContent = svar.stand === 'revner' ? 'Diamantslibning og reparation af revner'
        : svar.stand === 'maling' ? 'Diamantslibning, gammel maling slibes af'
          : svar.stand === 'paen' ? 'Diamantslibning'
            : 'Diamantslibning, evt. reparation';
      if (resultat.lbm) desk('hulkehl').textContent = `Op ad væggen, ca. ${Math.round(resultat.lbm)} lbm`;
    },
  };
}
