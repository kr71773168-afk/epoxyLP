/**
 * Meta Pixel. Indlæses først, når den besøgende har sagt ja til cookies.
 * Uden VITE_META_PIXEL_ID sker der ingenting (i dev logges events i konsollen).
 *
 * Lead sendes også fra serveren (CAPI) med samme event_id, så Meta kun tæller den én gang.
 */
const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';
const STANDARD = new Set(['PageView', 'Lead', 'Contact', 'ViewContent', 'Subscribe']);
const landet = Date.now();
let aktiv = false;

export const pixelKonfigureret = () => Boolean(PIXEL_ID);

export function aktiverPixel() {
  if (aktiv || !PIXEL_ID) return;
  aktiv = true;
  /* eslint-disable */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

export function deaktiverPixel() {
  if (aktiv && window.fbq) window.fbq('consent', 'revoke');
  aktiv = false;
}

export function track(navn, data = {}, eventId) {
  if (import.meta.env.DEV) console.info('[track]', navn, data, eventId ?? '');
  if (!aktiv || !window.fbq) return;
  const valg = eventId ? { eventID: eventId } : undefined;
  window.fbq(STANDARD.has(navn) ? 'track' : 'trackCustom', navn, data, valg);
}

export function nytEventId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cookie(navn) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${navn}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/** Alt, der skal med til attribution. Læses ved submit, så fbclid stadig står i URL'en. */
export function attribution() {
  const p = new URLSearchParams(window.location.search);
  const data = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gulv']) {
    const v = p.get(k);
    if (v) data[k] = v.slice(0, 500);
  }
  return {
    ...data,
    fbc: cookie('_fbc'),
    fbp: cookie('_fbp'),
    landet,
    side: window.location.href.split('#')[0],
    henviser: document.referrer || undefined,
  };
}
