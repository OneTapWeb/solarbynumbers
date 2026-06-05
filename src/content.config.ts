import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const journey = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journey' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { journey };
