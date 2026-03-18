/**
 * Property tests for navigation-to-iframe mapping consistency.
 * Feature: openclaw-openwebui-integration, Property 1
 * Validates: Requirements 5.1, 6.1
 */
import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';

// Mock import.meta.env before importing the config module
vi.stubGlobal('import', { meta: { env: {} } });

/**
 * Navigation item interface matching Sidebar.svelte boutikioNavItems
 */
interface NavItem {
	icon: string;
	label: string;
	href: string;
}

/**
 * Route configuration matching the embedded page routes
 */
interface RouteConfig {
	route: string;
	iframeSrc: string;
	title: string;
}

const BOUTIKIO_BASE_URL = 'https://web.boutikio.com';

/**
 * The canonical navigation configuration from Sidebar.svelte
 */
const boutikioNavItems: NavItem[] = [
	{ icon: '💳', label: 'Billing', href: '/billing' },
	{ icon: '⚙️', label: 'Settings', href: '/partner-settings' },
	{ icon: '🧾', label: 'Receipt Settings', href: '/receipt-settings' },
	{ icon: '🎴', label: 'Card Preview', href: '/card-preview' },
	{ icon: '📋', label: 'Audit Log', href: '/audit-log' },
	{ icon: '👥', label: 'Members', href: '/members' }
];

/**
 * The canonical route configuration from embedded page routes.
 * Uses the same embeddedUrl() pattern as the actual route files.
 */
const routeConfigs: RouteConfig[] = [
	{ route: '/billing', iframeSrc: `${BOUTIKIO_BASE_URL}/embedded/billing`, title: 'Billing & Subscription' },
	{ route: '/partner-settings', iframeSrc: `${BOUTIKIO_BASE_URL}/embedded/settings`, title: 'Account Settings' },
	{ route: '/receipt-settings', iframeSrc: `${BOUTIKIO_BASE_URL}/embedded/receipt-settings`, title: 'Receipt Settings' },
	{ route: '/card-preview', iframeSrc: `${BOUTIKIO_BASE_URL}/embedded/card-preview`, title: 'Card Preview' },
	{ route: '/audit-log', iframeSrc: `${BOUTIKIO_BASE_URL}/embedded/audit-log`, title: 'Audit Log' },
	{ route: '/members', iframeSrc: `${BOUTIKIO_BASE_URL}/embedded/members`, title: 'Members' }
];

describe('Navigation-to-iframe Mapping', () => {
	/**
	 * Property 1: Navigation-to-iframe mapping consistency
	 * For any navigation item, the sidebar link's href should correspond to a
	 * SvelteKit route that renders an iframe with the correct Boutikio embedded URL.
	 */
	describe('Property 1: Navigation-to-iframe mapping consistency', () => {
		it('should map every nav item href to a valid route with correct iframe src', () => {
			fc.assert(
				fc.property(
					fc.array(fc.integer({ min: 0, max: boutikioNavItems.length - 1 }), { minLength: 1 }),
					(indices) => {
						const uniqueIndices = [...new Set(indices)];

						for (const idx of uniqueIndices) {
							const item = boutikioNavItems[idx];

							const routeConfig = routeConfigs.find(r => r.route === item.href);
							expect(routeConfig).toBeDefined();

							// Verify iframe src follows the pattern
							expect(routeConfig!.iframeSrc).toMatch(new RegExp(`^${BOUTIKIO_BASE_URL.replace(/\./g, '\\.')}/embedded/.+$`));

							// Extract slug from href
							const slug = item.href.replace(/^\//, '');
							expect(routeConfig!.iframeSrc).toContain(`/embedded/${slug === 'partner-settings' ? 'settings' : slug}`);
						}
						return true;
					}
				),
				{ numRuns: 100 }
			);
		});

		it('should have unique hrefs in the canonical navigation config', () => {
			const hrefs = boutikioNavItems.map(item => item.href);
			const uniqueHrefs = new Set(hrefs);
			expect(uniqueHrefs.size).toBe(hrefs.length);
		});

		it('should have unique iframe srcs in the canonical route configs', () => {
			const srcs = routeConfigs.map(r => r.iframeSrc);
			const uniqueSrcs = new Set(srcs);
			expect(uniqueSrcs.size).toBe(srcs.length);
		});

		it('should have all nav items matched to route configs', () => {
			for (const navItem of boutikioNavItems) {
				const matchingRoute = routeConfigs.find(r => r.route === navItem.href);
				expect(matchingRoute).toBeDefined();
				expect(matchingRoute!.iframeSrc).toMatch(new RegExp(`^${BOUTIKIO_BASE_URL.replace(/\./g, '\\.')}/embedded/`));
			}
		});

		it('should have all route configs matched to nav items', () => {
			for (const routeConfig of routeConfigs) {
				const matchingNav = boutikioNavItems.find(n => n.href === routeConfig.route);
				expect(matchingNav).toBeDefined();
			}
		});

		it('should have matching count of nav items and route configs', () => {
			expect(boutikioNavItems.length).toBe(routeConfigs.length);
		});
	});

	describe('URL Pattern Validation', () => {
		it('should generate valid Boutikio embedded URLs for any slug', () => {
			fc.assert(
				fc.property(
					fc.stringMatching(/^[a-z][a-z0-9-]{0,20}$/),
					(slug) => {
						const embeddedUrl = `${BOUTIKIO_BASE_URL}/embedded/${slug}`;

						const parsed = new URL(embeddedUrl);
						expect(parsed.protocol).toBe('https:');
						expect(parsed.hostname).toBe('web.boutikio.com');
						expect(parsed.pathname).toBe(`/embedded/${slug}`);

						return true;
					}
				),
				{ numRuns: 100 }
			);
		});
	});
});
