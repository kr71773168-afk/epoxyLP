/**
 * Bysiderne: /epoxygulv-silkeborg/ osv. (src/pages/epoxygulv-[by].astro). Hver side har sine egne oplysninger, så den er til nytte for
 * folk fra byen og ikke bare en kopi med et andet bynavn. Afstande og køretider er ca. fra Silkeborg.
 * Alle byer her ligger i zonen i pricing.config.js.
 */
export const byer = [
  {
    slug: 'silkeborg',
    navn: 'Silkeborg',
    km: 0,
    min: 0,
    omraader: ['Resenbro', 'Virklund', 'Sejs-Svejbæk', 'Gødvad', 'Balle', 'Kjellerup', 'Them', 'Gjern'],
    tekst: 'Vi bor selv i Silkeborg, så der er kort vej fra din forespørgsel, til vi står og kigger på gulvet. Vi laver garager og kældre i hele kommunen, fra Kjellerup i nord til Them i syd.',
  },
  {
    slug: 'aarhus',
    navn: 'Aarhus',
    km: 45,
    min: 40,
    omraader: ['Viby', 'Højbjerg', 'Brabrand', 'Åbyhøj', 'Risskov', 'Tilst', 'Lystrup', 'Tranbjerg'],
    tekst: 'Aarhus og forstæderne ligger i vores område, og kørslen er med i prisen. Vi laver både garager og kældre i parcelhuskvartererne og gulve til værksteder, klinikker og butikker.',
  },
  {
    slug: 'herning',
    navn: 'Herning',
    km: 40,
    min: 35,
    omraader: ['Gullestrup', 'Tjørring', 'Lind', 'Snejbjerg', 'Sunds', 'Kibæk'],
    tekst: 'Herning har mange virksomheder og værksteder, hvor et slidstærkt gulv gør hverdagen nemmere. Vi laver selvfølgelig også garager og kældre hjemme hos folk.',
  },
  {
    slug: 'viborg',
    navn: 'Viborg',
    km: 42,
    min: 40,
    omraader: ['Overlund', 'Bjerringbro', 'Stoholm', 'Karup', 'Rødkærsbro', 'Tjele'],
    tekst: 'Fra Silkeborg er der en god halv time til Viborg. Vi laver gulve i hele kommunen, fra Karup og Stoholm til Bjerringbro.',
  },
  {
    slug: 'skanderborg',
    navn: 'Skanderborg',
    km: 32,
    min: 30,
    omraader: ['Ry', 'Galten', 'Hørning', 'Stilling', 'Låsby', 'Skovby'],
    tekst: 'Skanderborg og byerne omkring, som Ry og Galten, ligger lige ved siden af os. I garagen vælger de fleste flakes, fordi det skjuler snavs og hjulspor.',
  },
  {
    slug: 'horsens',
    navn: 'Horsens',
    km: 50,
    min: 40,
    omraader: ['Brædstrup', 'Hovedgård', 'Østbirk', 'Gedved', 'Lund', 'Stensballe'],
    tekst: 'Horsens og omegn ligger i vores område, og Brædstrup og Østbirk ligger lige på vejen derned. Både private og virksomheder kan få en vejledende pris her på siden.',
  },
  {
    slug: 'randers',
    navn: 'Randers',
    km: 58,
    min: 50,
    omraader: ['Assentoft', 'Dronningborg', 'Vorup', 'Langå', 'Spentrup'],
    tekst: 'Randers ligger i yderkanten af vores område, men kørslen er med i prisen. Vi samler gerne besigtigelser, så vi kan komme hurtigt ud.',
  },
  {
    slug: 'ikast',
    navn: 'Ikast',
    km: 27,
    min: 25,
    omraader: ['Bording', 'Engesvang', 'Brande', 'Nørre Snede', 'Ejstrupholm'],
    tekst: 'Ikast og Brande ligger tæt på Silkeborg, og vi laver gulve i hele Ikast-Brande Kommune, både hjemme hos folk og for virksomheder.',
  },
];

/** Stien til bysiden, fx epoxygulv-aarhus */
export const bySti = (b) => `epoxygulv-${b.slug}`;
