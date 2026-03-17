/**
 * Property tests for theme sync utilities.
 * Feature: openclaw-openwebui-integration, Property 2
 * Validates: Requirements 6.5, 6.6
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { buildThemeSyncMessage, type ThemeSyncMessage } from '../themeSyncBuilder';

// Mock browser APIs for Node.js test environment
const mockDocumentElement = {
	classList: {
		contains: vi.fn(() => false)
	}
};

vi.stubGlobal('document', {
	documentElement: mockDocumentElement
});

vi.stubGlobal('getComputedStyle', vi.fn(() => ({
	getPropertyValue: vi.fn((prop: string) => {
		// Return mock values for CSS variables
		const mockValues: Record<string, string> = {
			'--color-gray-50': '#f9fafb',
			'--color-gray-900': '#111827',
			'--color-blue-500': '#3b82f6',
			'--color-gray-200': '#e5e7eb'
		};
		return mockValues[prop] || '';
	})
})));

describe('Theme Sync Builder', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	/**
	 * Property 2: Theme sync message completeness
	 * For any theme sync trigger event, the theme-sync message must contain
	 * all required CSS variable keys and a valid --mode value.
	 */
	describe('Property 2: Theme sync message completeness', () => {
		it('should always contain all 5 required keys with valid CSS color values', () => {
			fc.assert(
				fc.property(
					// Generate random CSS color strings
					fc.record({
						'--owui-bg': cssColorArbitrary(),
						'--owui-text': cssColorArbitrary(),
						'--owui-accent': cssColorArbitrary(),
						'--owui-border': cssColorArbitrary()
					}),
					// Generate random boolean for dark mode
					fc.boolean(),
					(vars, isDark) => {
						const message: ThemeSyncMessage = buildThemeSyncMessage(vars, isDark);

						// Verify all 5 required keys are present
						expect(message.type).toBe('theme-sync');
						expect(message.vars).toHaveProperty('--owui-bg');
						expect(message.vars).toHaveProperty('--owui-text');
						expect(message.vars).toHaveProperty('--owui-accent');
						expect(message.vars).toHaveProperty('--owui-border');
						expect(message.vars).toHaveProperty('--mode');

						// Verify --mode is always either "dark" or "light"
						expect(['dark', 'light']).toContain(message.vars['--mode']);
						expect(message.vars['--mode']).toBe(isDark ? 'dark' : 'light');

						// Verify values are strings (CSS colors)
						expect(typeof message.vars['--owui-bg']).toBe('string');
						expect(typeof message.vars['--owui-text']).toBe('string');
						expect(typeof message.vars['--owui-accent']).toBe('string');
						expect(typeof message.vars['--owui-border']).toBe('string');

						return true;
					}
				),
				{ numRuns: 100 }
			);
		});

		it('should return valid mode value for any boolean input', () => {
			fc.assert(
				fc.property(fc.boolean(), (isDark) => {
					const message = buildThemeSyncMessage({}, isDark);

					expect(message.vars['--mode']).toBe(isDark ? 'dark' : 'light');
					return true;
				}),
				{ numRuns: 100 }
			);
		});

		it('should provide fallback values when vars are empty or missing', () => {
			fc.assert(
				fc.property(
					fc.record({
						'--owui-bg': fc.oneof(fc.constant(''), fc.constant('   '), cssColorArbitrary()),
						'--owui-text': fc.oneof(fc.constant(''), fc.constant('   '), cssColorArbitrary()),
						'--owui-accent': fc.oneof(fc.constant(''), fc.constant('   '), cssColorArbitrary()),
						'--owui-border': fc.oneof(fc.constant(''), fc.constant('   '), cssColorArbitrary())
					}),
					fc.boolean(),
					(vars, isDark) => {
						const message = buildThemeSyncMessage(vars, isDark);

						// Should always have valid values (either provided or fallbacks)
						expect(message.vars['--owui-bg'].length).toBeGreaterThan(0);
						expect(message.vars['--owui-text'].length).toBeGreaterThan(0);
						expect(message.vars['--owui-accent'].length).toBeGreaterThan(0);
						expect(message.vars['--owui-border'].length).toBeGreaterThan(0);

						return true;
					}
				),
				{ numRuns: 100 }
			);
		});

		it('should handle undefined vars by using document defaults', () => {
			const message = buildThemeSyncMessage(undefined, false);

			// Should use fallback values from mocked getComputedStyle
			expect(message.vars['--owui-bg']).toBe('#f9fafb');
			expect(message.vars['--owui-text']).toBe('#111827');
			expect(message.vars['--owui-accent']).toBe('#3b82f6');
			expect(message.vars['--owui-border']).toBe('#e5e7eb');
			expect(message.vars['--mode']).toBe('light');
		});
	});
});

/**
 * Arbitrary for generating valid CSS color strings.
 * Supports hex colors, rgb(), rgba(), and named colors.
 */
function cssColorArbitrary(): fc.Arbitrary<string> {
	return fc.oneof(
		// Hex colors (6 characters)
		fc.tuple(
			fc.constant('#'),
			fc.string({ minLength: 6, maxLength: 6 }).map(s => s.replace(/[^0-9a-fA-F]/g, '0'))
		).map(([h, c]) => h + c),
		// rgb() format
		fc.tuple(
			fc.integer({ min: 0, max: 255 }),
			fc.integer({ min: 0, max: 255 }),
			fc.integer({ min: 0, max: 255 })
		).map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`),
		// rgba() format
		fc.tuple(
			fc.integer({ min: 0, max: 255 }),
			fc.integer({ min: 0, max: 255 }),
			fc.integer({ min: 0, max: 255 }),
			fc.float({ min: 0, max: 1 })
		).map(([r, g, b, a]) => `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`),
		// Named colors
		fc.constantFrom('red', 'blue', 'green', 'white', 'black', 'transparent', 'currentColor')
	);
}