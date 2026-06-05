// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://solarbynumbers.co.uk',
  integrations: [sitemap()],
  trailingSlash: 'ignore',
  markdown: {
    shikiConfig: {
      theme: 'vitesse-light',
    },
  },
});
