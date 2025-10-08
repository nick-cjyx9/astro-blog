import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

import pagefind from 'astro-pagefind'
import { defineConfig } from 'astro/config'

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  site: 'https://nickchen.top',

  build: {
    format: 'file',
  },

  integrations: [sitemap(), pagefind(), vue()],
  prefetch: true,
  adapter: cloudflare(),
  output: 'static',
  imageService: 'compile',

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
})