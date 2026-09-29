/**
 * Guides under Viden. Hver guide er en side (src/pages/<slug>.astro) med beregneren i bunden.
 * Afsnit: `tekst` er afsnit (HTML tilladt), `punkter` er en liste, `tabel` er en sammenligning.
 * <span data-pladsholder> markerer tal og løfter, som kunden skal bekræfte.
 */
import { link } from '../lib/link.js';
import { firma } from './firma.js';

export const guides = [
  {
    slug: 'epoxy-eller-gulvmaling',
    titel: 'Epoxy eller gulvmaling på garagegulvet? Forskellen forklaret',
    beskrivelse: 'Gulvmaling er billigst i dag, men epoxy holder meget længere i en garage. Se forskellen på holdbarhed, pris og forarbejde, og hvad der passer til dit gulv.',
    h1: 'Epoxy eller gulvmaling på garagegulvet?',
    kort: 'Maling er billigst i dag. Epoxy holder i mange år. Her er forskellen.',
    intro: 'Begge dele gør betongulvet pænere og nemmere at feje. Men der er stor forskel på, hvor længe de holder, når der kører en bil ind og ud hver dag.',
    billede: 'gulv-flakes-2',
    rum: 'garage',
    afsnit: [
      {
        titel: 'Gulvmaling er billigt, men tyndt',
        tekst: [
          'Almindelig gulvmaling ligger i et tyndt lag oven på betonen. Den er billig, og du kan selv male. Til gengæld slides den hurtigt, hvor bilen kører, og varme dæk kan trække malingen af. Mange må male igen efter få år.',
        ],
      },
      {
        titel: 'Epoxy bliver en del af gulvet',
        tekst: [
          'Epoxy består af to dele, der hærder til et hårdt og tæt lag. Når betonen er slebet først, hæfter epoxyen i den og bliver en del af gulvet. Det tåler bil, olie og vejsalt og holder i mange år.',
          'Der findes også epoxymaling i tynde lag. Den er bedre end almindelig gulvmaling, men det er ikke det samme som et epoxygulv, der er lagt i flere lag.',
        ],
      },
      {
        titel: 'Forskellen kort',
        tabel: {
          hoved: ['', 'Gulvmaling', 'Epoxygulv'],
          raekker: [
            ['Holder', 'Få år, hvor bilen kører', 'Mange år'],
            ['Lag', 'Et tyndt lag', 'Flere lag med toplak'],
            ['Varme dæk', 'Kan trække malingen af', 'Tåler dem'],
            ['Olie og vejsalt', 'Trænger ind, hvor malingen er slidt', 'Bliver ovenpå og tørres af'],
            ['Pris i dag', 'Lav', 'Højere'],
            ['Kan du selv', 'Ja', 'Nej, det kræver slibemaskine og erfaring'],
          ],
        },
      },
      {
        titel: 'Forarbejdet betyder mest',
        tekst: [
          'Uanset hvad du vælger, afhænger resultatet af forarbejdet. Betonen skal være ren, tør og slebet, og revner skal repareres. Springer man det over, slipper både maling og epoxy.',
        ],
      },
      {
        titel: 'Hvad koster det?',
        tekst: [
          'Maling koster mindst i dag, især hvis du selv gør arbejdet. Et epoxygulv koster mere, men skal ikke laves om efter få år. Svar på seks spørgsmål herunder, så ser du prisen på dit garagegulv.',
        ],
      },
    ],
    relaterede: ['garagegulv', 'flakesgulv'],
  },
  {
    slug: 'hvor-laenge-holder-et-epoxygulv',
    titel: 'Hvor længe holder et epoxygulv? Levetid og vedligehold',
    beskrivelse: 'Et godt lagt epoxygulv holder i mange år. Se hvad der afgør levetiden, hvornår toplakken skal fornyes, og hvordan du får gulvet til at holde længst.',
    h1: 'Hvor længe holder et epoxygulv?',
    kort: 'Det afgør levetiden, og sådan får du gulvet til at holde længst.',
    intro: 'Et epoxygulv, der er lagt rigtigt, holder i mange år i en garage, kælder eller bolig. Hvor længe afhænger mest af forarbejdet, opbygningen og hvor hårdt gulvet bliver brugt.',
    billede: 'gulv-metallic',
    afsnit: [
      {
        titel: 'Så længe holder det',
        tekst: [
          '<span data-pladsholder>I en bolig, kælder eller garage kan et godt lagt epoxygulv holde i 10-20 år eller mere, når toplakken bliver holdt ved lige.</span> I et værksted med truck og tunge maskiner bliver det slidt hurtigere.',
        ],
      },
      {
        titel: 'Det afgør levetiden',
        punkter: [
          '<strong>Forarbejdet.</strong> Betonen skal slibes, repareres og fugtmåles. Det er det vigtigste af det hele.',
          '<strong>Opbygningen.</strong> Flere lag og en god toplak holder længere end et enkelt tyndt lag.',
          '<strong>Brugen.</strong> En garage med bil hver dag slides mere end en kælder.',
          '<strong>Solen.</strong> Almindelig epoxy kan gulne i direkte sollys. En UV-stabil toplak forhindrer det.',
        ],
      },
      {
        titel: 'Toplakken kan fornyes',
        tekst: [
          'Det første, der slides, er toplakken. Den bliver mat, hvor der går og kører mest. Så kan den slibes let og lakeres igen, uden at hele gulvet skal laves om. Det koster en brøkdel af et nyt gulv.',
        ],
      },
      {
        titel: 'Sådan holder gulvet længst',
        punkter: [
          'Fej eller støvsug jævnligt, så sand og grus ikke sliber overfladen.',
          'Tør olie og kemikalier op med det samme.',
          'Skyl vejsalt af om vinteren.',
          'Sæt filt under møbler, og læg en måtte ved døren.',
        ],
        efter: `Se mere i guiden <a href="${link('rengoering-af-epoxygulv')}">Sådan gør du rent på et epoxygulv</a>.`,
      },
      {
        titel: 'Garanti',
        tekst: [
          `Vi giver <span data-pladsholder>${firma.garanti}</span> på vores gulve. Sker der noget, der skyldes vores arbejde, kommer vi og udbedrer det.`,
        ],
      },
    ],
    relaterede: ['garagegulv', 'ensfarvet-epoxy'],
  },
  {
    slug: 'epoxygulv-og-gulvvarme',
    titel: 'Epoxygulv og gulvvarme: Det skal du vide',
    beskrivelse: 'Ja, du kan få epoxygulv på gulvvarme. Gulvet er tyndt og leder varmen godt. Se hvad der skal til, før og efter gulvet bliver lagt.',
    h1: 'Kan man få epoxygulv med gulvvarme?',
    kort: 'Ja. Men gulvvarmen skal styres, mens gulvet bliver lagt.',
    intro: 'Ja. Et epoxygulv er tyndt og ligger direkte på betonen, så varmen kommer godt igennem. Det kræver bare, at gulvvarmen bliver styret rigtigt, mens gulvet bliver lagt og hærder.',
    billede: 'gulv-bolig',
    rum: 'bolig',
    afsnit: [
      {
        titel: 'Før vi går i gang',
        tekst: [
          'Gulvvarmen skal slukkes i god tid, før vi lægger gulvet, så betonen ikke er varm. Epoxy hærder for hurtigt og ujævnt på et varmt underlag, og det kan give bobler i overfladen.',
          'Er gulvet nystøbt, skal betonen være tør nok. Vi måler fugten ved besigtigelsen.',
        ],
      },
      {
        titel: 'Når gulvet er lagt',
        tekst: [
          'Når gulvet er hærdet, skrues varmen langsomt op igen over nogle dage. Så får betonen og gulvet tid til at vænne sig til temperaturen. Vi aftaler det præcise forløb med dig.',
        ],
      },
      {
        titel: 'Hvordan føles det?',
        tekst: [
          'Et epoxygulv føles som et stengulv. Uden gulvvarme kan det være køligt at gå på med bare tæer. Med gulvvarme er det behageligt, og gulvet holder godt på varmen.',
        ],
      },
      {
        titel: 'Revner i betonen',
        tekst: [
          'Gulvvarme får betonen til at arbejde lidt, når temperaturen skifter. Derfor reparerer vi revner, før vi lægger epoxy. Er der revner, der kan komme igen, siger vi det ved besigtigelsen.',
        ],
      },
    ],
    relaterede: ['gulv-i-boligen', 'metallic-epoxy'],
  },
  {
    slug: 'rengoering-af-epoxygulv',
    titel: 'Rengøring af epoxygulv: Sådan holder du det pænt',
    beskrivelse: 'Sådan gør du rent på et epoxygulv: hvad du skal bruge, hvad du skal holde dig fra, og hvordan du fjerner olie, vejsalt og mærker fra dæk.',
    h1: 'Sådan gør du rent på et epoxygulv',
    kort: 'Vand, et mildt gulvvaskemiddel og en blød moppe. Og det, du skal holde dig fra.',
    intro: 'Et epoxygulv er tæt og glat, så snavset bliver ovenpå i stedet for at trænge ned. Det meste klarer du med en kost og en moppe.',
    billede: 'gulv-ensfarvet',
    afsnit: [
      {
        titel: 'Til hverdag',
        punkter: [
          'Fej eller støvsug, så sand og grus ikke sliber overfladen.',
          'Vask med lunkent vand og et mildt, pH-neutralt gulvvaskemiddel.',
          'Brug en blød moppe eller gulvskrubbe. I garagen er en gulvskraber god til at trække vandet væk.',
        ],
      },
      {
        titel: 'Det skal du holde dig fra',
        punkter: [
          'Grøn sæbe og midler med voks. De lægger en hinde, der gør gulvet mat og glat.',
          'Stærke syrer og opløsningsmidler. Tør spild op med det samme.',
          'Stålsvampe og skuresvampe, der ridser toplakken.',
        ],
      },
      {
        titel: 'Olie, vejsalt og mærker fra dæk',
        tekst: [
          'Olie og bremsevæske tørrer du op med køkkenrulle og vasker efter med vand og gulvvaskemiddel. Vejsalt skyller du af om vinteren, så det ikke ligger og tørrer ind. Sorte mærker fra dæk går som regel af med et affedtende rengøringsmiddel og en blød børste.',
        ],
      },
      {
        titel: 'Hvor tit?',
        tekst: [
          'I en garage er det nok at feje hver uge og vaske gulvet, når det trænger. I en bolig gør du rent, som du ville på ethvert andet gulv.',
        ],
      },
    ],
    relaterede: ['garagegulv', 'gulv-i-boligen'],
  },
  {
    slug: 'epoxy-paa-fliser',
    titel: 'Epoxy på fliser: Kan man lægge epoxygulv oven på fliser?',
    beskrivelse: 'Ja, du kan ofte få epoxy direkte på fliser, så du slipper for at hugge dem op. Se hvornår det kan lade sig gøre, og hvad der skal til.',
    h1: 'Kan man lægge epoxy på fliser?',
    kort: 'Ofte ja, så du slipper for at hugge fliserne op. Men de skal sidde fast.',
    intro: 'Ja, ofte. Sidder fliserne godt fast, kan vi lægge epoxy direkte ovenpå, så du slipper for at hugge dem op. Det sparer tid, støv og penge.',
    billede: 'haelder',
    rum: 'bolig',
    afsnit: [
      {
        titel: 'Fliserne skal sidde fast',
        tekst: [
          'Vi banker gulvet igennem ved besigtigelsen. Løse eller hule fliser skal tages op og repareres. Ellers kan de knække eller løsne sig under epoxyen senere.',
        ],
      },
      {
        titel: 'Sådan gør vi',
        punkter: [
          'Vi sliber glasuren af fliserne, så epoxyen kan hæfte.',
          'Vi fylder fugerne og spartler, så de ikke kan ses gennem gulvet.',
          'Så lægger vi epoxy, som vi ville gøre på beton.',
        ],
      },
      {
        titel: 'Kan man se fliserne bagefter?',
        tekst: [
          'Nej, ikke når fugerne er fyldt og gulvet er lagt i flere lag. Er fliserne meget ujævne, lægger vi et udjævningslag først. Det ser vi på ved besigtigelsen.',
        ],
      },
      {
        titel: 'Gulvvarme under fliserne?',
        tekst: [
          `Det går fint. Gulvvarmen skal bare styres, mens gulvet bliver lagt. Læs mere i guiden <a href="${link('epoxygulv-og-gulvvarme')}">Epoxygulv og gulvvarme</a>.`,
        ],
      },
    ],
    relaterede: ['gulv-i-boligen', 'kaeldergulv'],
  },
];

export const guide = (slug) => guides.find((g) => g.slug === slug);

/** Dato for seneste gennemgang af guiderne (bruges i strukturerede data) */
export const opdateret = '2026-09-29';

/** Ca. læsetid i minutter ud fra antal ord (180 ord i minuttet, rundet op) */
export function laesetid(g) {
  const tekst = [g.intro, ...g.afsnit.flatMap((a) => [a.titel, ...(a.tekst ?? []), ...(a.punkter ?? []), ...(a.tabel?.raekker.flat() ?? [])])].join(' ');
  const ord = tekst.replace(/<[^>]+>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(ord / 180));
}
