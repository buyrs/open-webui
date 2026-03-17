import type { RequestHandler } from './$types';

const BASE_URL = 'https://chat.boutikio.com';

// Static pages
const staticPages = [
	{ loc: '/', changefreq: 'daily', priority: 1.0 },
	{ loc: '/billing', changefreq: 'weekly', priority: 0.8 },
	{ loc: '/partner-settings', changefreq: 'weekly', priority: 0.7 },
	{ loc: '/receipt-settings', changefreq: 'weekly', priority: 0.6 },
	{ loc: '/card-preview', changefreq: 'weekly', priority: 0.6 },
	{ loc: '/audit-log', changefreq: 'daily', priority: 0.5 },
	{ loc: '/members', changefreq: 'daily', priority: 0.8 }
];

function generateSitemap(): string {
	const urls = staticPages
		.map(
			(page) => `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
		)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export const GET: RequestHandler = async () => {
	const sitemap = generateSitemap();

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600, s-maxage=3600'
		}
	});
};