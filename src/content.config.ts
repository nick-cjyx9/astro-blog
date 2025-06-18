import { glob } from 'astro/loaders'
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  // Type-check frontmatter using a schema
  schema: () => z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z.coerce.date(),
    lastModified: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
  }),
})

const friend = defineCollection({
  loader: glob({ base: './src/content/friend', pattern: '**/*.{md,mdx}' }),
  schema: () => z.object({
    name: z.string(),
    link: z.string(),
    description: z.string().optional(),
    avatar: z.string(),
    color: z.string(),
  }),
})

export const collections = { blog, friend }
