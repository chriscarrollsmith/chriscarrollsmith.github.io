import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://christophercarrollsmith.com',
  integrations: [react()],
  vite: {
    ssr: {
      noExternal: ['react-helmet-async', '@formspree/react', 'convertkit-react', 'react-calendly']
    }
  }
});
