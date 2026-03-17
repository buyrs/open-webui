import type { RequestHandler } from './$types';
import { languages, type LanguageCode } from '$lib/i18n/seoTranslations';
import { WEBUI_PUBLIC_URL } from '$lib/config/boutikio';

// Pre-render at build time so the sitemap exists as a static file
export const prerender = true;

const BASE_URL = WEBUI_PUBLIC_URL;

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

// Supported languages (French is default)
const supportedLanguages = Object.keys(languages) as LanguageCode[];

function generateSitemap(): string {
	const urls: string[] = [];

	staticPages.forEach((page) => {
		// Generate URL entry for each page with all language variants
		const languageLinks = supportedLanguages
			.map((lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${BASE_URL}${page.loc}?lang=${lang}"/>`)
			.join('\n');

		// Default URL without query param
		const defaultUrl = `${BASE_URL}${page.loc}`;

		urls.push(`  <url>
    <loc>${defaultUrl}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${languageLinks}
    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultUrl}"/>
  </url>`);
	});

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
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