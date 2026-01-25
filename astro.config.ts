import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { remarkMermaidImages } from './src/remark/remarkMermaidImages';

// https://astro.build/config
export default defineConfig({
  site: 'https://christophercarrollsmith.com',
  integrations: [
    react(),
    sitemap(),
    mdx({
      remarkPlugins: [remarkMermaidImages],
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['@formspree/react', 'convertkit-react']
    }
  }
});
