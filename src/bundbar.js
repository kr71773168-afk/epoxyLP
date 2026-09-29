/**
 * Knap i bunden på mobil, når beregneren er rullet ud af syne.
 * Før prisen: "Se hvad dit gulv koster". Efter: prisen og et link til formularen.
 */
export function startBundbar(beregner) {
  const bar = document.getElementById('bundbar');
  const knap = document.getElementById('bundbar-knap');
  const tekst = document.getElementById('bundbar-tekst');
  const quiz = document.getElementById('beregner');
  const tak = document.getElementById('tak');
  const slut = document.querySelector('.slut');
  const smal = window.matchMedia('(max-width: 900px)');
  let quizSynlig = true;
  let slutSynlig = false;

  function opdater() {
    const { prisTekst } = beregner.status();
    tekst.textContent = prisTekst ? `Din pris: ${prisTekst}` : 'Se hvad dit gulv koster';
    knap.setAttribute('href', prisTekst ? '#lead' : '#beregner');
    bar.hidden = !smal.matches || quizSynlig || slutSynlig || !tak.hidden;
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      quizSynlig = e.isIntersecting;
      opdater();
    }).observe(quiz);
    // Den sidste sektion har sin egen knap
    if (slut) {
      new IntersectionObserver(([e]) => {
        slutSynlig = e.isIntersecting;
        opdater();
      }).observe(slut);
    }
  }
  smal.addEventListener?.('change', opdater);
  beregner.lyt(opdater);
  opdater();
}
