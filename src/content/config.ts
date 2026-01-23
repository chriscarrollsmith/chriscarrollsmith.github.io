import { z, defineCollection } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    excerpt: z.string(),
    image: z.string().optional(),
    sourceUrl: z.string().url().optional(),
    sourceId: z.string().optional(),
    legacyId: z.union([z.string(), z.number()]).optional(),
  }),
});

export const collections = { blog };

