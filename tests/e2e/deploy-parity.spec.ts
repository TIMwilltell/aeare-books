import { expect, test } from '@playwright/test';

import { assertSignedOutRedirect, protectedRoutes } from './helpers/auth';

test.describe('deploy parity', () => {
	for (const route of protectedRoutes) {
		test(`parity keeps signed-out redirect behavior for ${route}`, async ({ page }) => {
			await assertSignedOutRedirect(page, route);
		});
	}

	test('parity keeps AR lookup graceful when Cloudflare Browser Rendering is unavailable', async ({ request }) => {
		const response = await request.get('/api/ar?isbn=9999999999999');
		expect([200, 404, 503]).toContain(response.status());

		const body = await response.json();
		const fallbackMessage = typeof body.error === 'string' ? body.error : '';

		expect([
			'AR fallback is unavailable until the Cloudflare Browser Rendering binding is configured.',
			'AR fallback temporarily unavailable for this ISBN',
			'AR lookup failed',
			'Book not found in AR database'
		]).toContain(fallbackMessage);
	});
});
