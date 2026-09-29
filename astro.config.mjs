import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// DEMO=1 bygger et preview med flade .html-filer og relative links (til delelinks uden server)
const demo = process.env.DEMO === '1';

export default defineConfig({
  site: 'https://silkeborgepoxy.dk', // PLADSHOLDER: kundens rigtige domæne
  outDir: demo ? './dist-demo' : './dist',
  build: { format: demo ? 'file' : 'directory' },
  integrations: demo ? [] : [sitemap()],
  vite: {
    envPrefix: ['PUBLIC_', 'VITE_'],
    define: { __FLADE_LINKS__: JSON.stringify(demo) },
  },
});
