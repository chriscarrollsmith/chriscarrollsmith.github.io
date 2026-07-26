import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { remarkMermaidImages } from './src/remark/remarkMermaidImages';
import { getLegacyBlogRedirects, shouldIncludeInSitemap } from './src/seo/blogRoutes';

// https://astro.build/config
export default defineConfig({
  site: 'https://christophercarrollsmith.com',
  redirects: getLegacyBlogRedirects(),
  integrations: [
    react(),
    sitemap({
      filter: shouldIncludeInSitemap,
    }),
    mdx({
      remarkPlugins: [remarkMermaidImages],
    }),
  ],
  vite: {
    ssr: {
      noExternal: ['@formspree/react']
    }
  }
});
