import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  // Load Markdown and MDX files in the `src/content/blog/` directory.
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // Transform string to Date object
      pubDate: z.coerce.date(),
      lastModified: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
      author: z.string().optional(),
    }),
})

const friend = defineCollection({
  loader: glob({ base: './src/content/friend', pattern: '**/*.{md,mdx}' }),
  schema: () =>
    z.object({
      name: z.string(),
      link: z.string(),
      description: z.string().optional(),
      avatar: z.string(),
      color: z.string(),
    }),
})

const project = defineCollection({
  loader: glob({ base: './src/content/project', pattern: '**/*.{md,mdx}' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      tech: z.array(z.string()),
      link: z.string(),
      status: z.enum(['正在开发', '计划中', '筹备中', '已完成', '已暂停']),
    }),
})

export const collections = { blog, friend, project }
