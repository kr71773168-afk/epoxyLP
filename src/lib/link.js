/* global __FLADE_LINKS__ */
/**
 * Alle interne links går gennem link(). Det rigtige site bruger pæne URL'er (/garagegulv/),
 * preview-byggeriet (DEMO=1) bruger flade filer (garagegulv.html), så det kan deles uden server.
 */
export function link(slug = '', hash = '') {
  if (__FLADE_LINKS__) return `${slug ? `${slug}.html` : './'}${hash}`;
  return `${slug ? `/${slug}/` : '/'}${hash}`;
}

/** Filer i public/, fx favicon.svg */
export const fil = (navn) => (__FLADE_LINKS__ ? navn : `/${navn}`);
