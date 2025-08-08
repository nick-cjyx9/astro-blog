import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import pagefind from 'astro-pagefind'

// @ts-check
import { defineConfig } from 'astro/config'
// import remarkModifiedTime from './src/utils/remark/remark-modified-time.mjs'

// https://astro.build/config
export default defineConfig({
  site: 'https://nickchen.top',

  build: {
    format: 'file',
  },

  integrations: [pagefind(), sitemap()],
  prefetch: true,
  adapter: cloudflare(),
  output: 'static',
  imageService: 'compile',

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    // remarkPlugins: [remarkModifiedTime],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
})
