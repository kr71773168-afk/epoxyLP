/**
 * Knap i bunden på mobil, når beregneren er rullet ud af syne.
 * Før sidste trin: "Se hvad dit gulv koster". På sidste trin: "Din pris er klar". Når prisen er vist, forsvinder den.
 */
export function startBundbar(beregner) {
  const bar = document.getElementById('bundbar');
  const tekst = document.getElementById('bundbar-tekst');
  const quiz = document.getElementById('beregner');
  const slut = document.querySelector('.slut');
  const smal = window.matchMedia('(max-width: 900px)');
  let quizSynlig = true;
  let slutSynlig = false;

  function opdater() {
    const { erSlut, prisVist } = beregner.status();
    tekst.textContent = erSlut ? 'Din pris er klar' : 'Se hvad dit gulv koster';
    bar.hidden = !smal.matches || quizSynlig || slutSynlig || prisVist;
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
