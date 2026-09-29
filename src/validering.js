// Delt mellem formularen i browseren og Netlify-funktionen, så reglerne er de samme begge steder.

/** Dansk nummer med 8 cifre. +45/0045 og mellemrum fjernes. Returnerer null, hvis det ikke er gyldigt. */
export function normaliserTelefon(v) {
  const cifre = String(v ?? '').replace(/[^\d+]/g, '').replace(/^(\+45|0045)/, '');
  return /^[2-9]\d{7}$/.test(cifre) ? cifre : null;
}

export const gyldigMail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v ?? '').trim());
