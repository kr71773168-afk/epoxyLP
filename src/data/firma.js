/**
 * Firmaets oplysninger. Alt med `pladsholder: true` eller markeret i kommentaren skal bekræftes af kunden.
 * `kladde: true` markerer pladsholdere med gult og sætter noindex på alle sider. Slås fra ved launch.
 */
export const firma = {
  kladde: true,
  navn: 'Silkeborg Epoxy',
  juridiskNavn: 'Silkeborg Epoxygulve ApS',
  cvr: '46299752',
  telefon: '00 00 00 00', // PLADSHOLDER
  telefonLink: '+4500000000', // PLADSHOLDER
  mail: 'kontakt@example.dk', // PLADSHOLDER
  adresse: { vej: 'Hjejlevej 12', postnr: '8600', by: 'Silkeborg' }, // PLADSHOLDER
  ejer: '[Navn]', // PLADSHOLDER
  garanti: '5 års garanti', // PLADSHOLDER
  svartid: 'inden for 24 timer på hverdage', // PLADSHOLDER
  aabningstider: 'Hverdage 7-16', // PLADSHOLDER
  omraade: 'Silkeborg og 60 km omkring',
};
