import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// DEMO=1 bygger et preview med flade .html-filer og relative links (til delelinks uden server)
const demo = process.env.DEMO === '1';

export default defineConfig({
  site: 'https://silkeborgepoxy.dk', // PLADSHOLDER: kundens rigtige domæne
  outDir: demo ? './dist-demo' : './dist',
  // Preview: artifact-tjenesten tillader ikke mapper, der starter med _, så _astro hedder filer
  build: { format: demo ? 'file' : 'directory', assets: demo ? 'filer' : '_astro' },
  integrations: demo ? [] : [sitemap()],
  devToolbar: { enabled: false },
  vite: {
    envPrefix: ['PUBLIC_', 'VITE_'],
    define: { __FLADE_LINKS__: JSON.stringify(demo) },
  },
});
