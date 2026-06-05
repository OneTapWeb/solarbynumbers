import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('journey')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  return rss({
    title: 'Solar by Numbers · journey',
    description:
      'Install diary for a UK solar and battery project: Sigenergy, Predbat, Octopus Agile, and real daily performance data.',
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.summary,
      link: `/journey/${p.id}/`,
    })),
  });
}
