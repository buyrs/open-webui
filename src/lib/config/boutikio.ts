/**
 * Centralized Boutikio configuration.
 * All external URLs and shared constants live here so they can be changed in one place.
 */
import { type LanguageCode, defaultLanguage, languages } from '$lib/i18n/seoTranslations';

/**
 * Base URL for the Boutikio backend (OAuth, OpenClaw, embedded pages).
 * Override via VITE_BOUTIKIO_BASE_URL env var for staging/dev environments.
 */
export const BOUTIKIO_BASE_URL: string =
	(typeof import.meta !== 'undefined' && import.meta.env?.VITE_BOUTIKIO_BASE_URL) ||
	'https://app.boutikio.com';

/**
 * Base URL for the Open WebUI frontend (canonical URLs, SEO).
 * Override via VITE_WEBUI_PUBLIC_URL env var for staging/dev environments.
 */
export const WEBUI_PUBLIC_URL: string =
	(typeof import.meta !== 'undefined' && import.meta.env?.VITE_WEBUI_PUBLIC_URL) ||
	'https://chat.boutikio.com';

/**
 * Builds a full embedded page URL from a slug.
 */
export function embeddedUrl(slug: string): string {
	return `${BOUTIKIO_BASE_URL}/embedded/${slug}`;
}

/**
 * Validates and returns a LanguageCode from an untrusted string input.
 * Falls back to the default language if the input is invalid.
 */
export function parseLanguage(input: string | null | undefined): LanguageCode {
	if (input && input in languages) {
		return input as LanguageCode;
	}
	return defaultLanguage;
}
