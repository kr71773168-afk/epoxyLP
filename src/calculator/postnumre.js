let data = null;

/** Indlæser postnummerlisten første gang, den skal bruges (ca. 7 kB gzip). */
async function hent() {
  if (!data) data = (await import('./postnumre.json')).default;
  return data;
}

/** Hent listen i baggrunden, så opslaget er klar, når man når til postnummeret. */
export function forvarmPostnumre() {
  hent().catch(() => { /* prøves igen ved opslag */ });
}

/**
 * @returns {Promise<{by: string, iZone: boolean} | null>} null, hvis postnummeret ikke findes
 */
export async function slaaOpPostnummer(postnr, zone) {
  if (!/^\d{4}$/.test(postnr)) return null;
  const post = (await hent())[postnr];
  if (!post) return null;
  const [by, kommuner] = post;
  const iZone = !zone.udelukPostnumre.includes(postnr)
    && (zone.ekstraPostnumre.includes(postnr) || kommuner.some((k) => zone.kommuner.includes(k)));
  return { by, iZone };
}
