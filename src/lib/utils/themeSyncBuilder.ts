/**
 * Theme sync utilities for embedded page communication.
 * Used by EmbeddedPage.svelte to synchronize Open WebUI theme with embedded iframes.
 */

/**
 * Message sent from parent to iframe to synchronize theme colors.
 */
export interface ThemeSyncMessage {
	type: 'theme-sync';
	vars: {
		'--owui-bg': string;
		'--owui-text': string;
		'--owui-accent': string;
		'--owui-border': string;
		'--mode': 'dark' | 'light';
	};
}

/**
 * Message sent from iframe to parent to indicate readiness for theme sync.
 */
export interface EmbeddedReadyMessage {
	type: 'embedded-ready';
}

/**
 * CSS variable mappings from Open WebUI to Boutikio embedded pages.
 */
const CSS_VAR_MAPPINGS: Record<string, string> = {
	'--color-gray-50': '--owui-bg',
	'--color-gray-900': '--owui-text',
	'--color-blue-500': '--owui-accent',
	'--color-gray-200': '--owui-border'
};

/**
 * Extracts theme CSS variables from the document's computed styles.
 * @returns Record of CSS variable names to their current values
 */
export function extractThemeVars(): Record<string, string> {
	const styles = getComputedStyle(document.documentElement);
	const vars: Record<string, string> = {};

	for (const [sourceVar, targetVar] of Object.entries(CSS_VAR_MAPPINGS)) {
		const value = styles.getPropertyValue(sourceVar).trim();
		vars[targetVar] = value || '#ffffff';
	}

	return vars;
}

/**
 * Determines if the current theme is dark mode.
 * @returns true if dark mode is active
 */
export function isDarkMode(): boolean {
	return document.documentElement.classList.contains('dark');
}

/**
 * Builds a theme sync message payload.
 * @param vars - CSS variable values (if not provided, extracts from document)
 * @param isDark - Dark mode flag (if not provided, detects from document)
 * @returns ThemeSyncMessage ready to send via postMessage
 */
export function buildThemeSyncMessage(
	vars?: Record<string, string>,
	isDark?: boolean
): ThemeSyncMessage {
	const extractedVars = vars ?? extractThemeVars();
	const dark = isDark ?? isDarkMode();

	return {
		type: 'theme-sync',
		vars: {
			'--owui-bg': extractedVars['--owui-bg'] || '#ffffff',
			'--owui-text': extractedVars['--owui-text'] || '#111827',
			'--owui-accent': extractedVars['--owui-accent'] || '#3b82f6',
			'--owui-border': extractedVars['--owui-border'] || '#e5e7eb',
			'--mode': dark ? 'dark' : 'light'
		}
	};
}