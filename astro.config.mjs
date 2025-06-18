import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
// @ts-check
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://nickchen.top',
  integrations: [mdx(), sitemap()],
  adapter: cloudflare(),
  output: 'static',
  // <a href="/about" data-astro-prefetch>
  // add a tag like it to enable prefetch. link: https://docs.astro.build/zh-cn/guides/prefetch/
  prefetch: true,
  imageService: 'compile',
})
