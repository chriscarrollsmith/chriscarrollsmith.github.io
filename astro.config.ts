import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://christophercarrollsmith.com',
  integrations: [react(), sitemap()],
  vite: {
    ssr: {
      noExternal: ['@formspree/react', 'convertkit-react']
    }
  }
});
