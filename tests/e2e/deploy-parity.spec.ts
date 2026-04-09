import { expect, test } from '@playwright/test';

import { assertSignedOutRedirect, protectedRoutes } from './helpers/auth';

test.describe('deploy parity', () => {
	for (const route of protectedRoutes) {
		test(`parity keeps signed-out redirect behavior for ${route}`, async ({ page }) => {
			await assertSignedOutRedirect(page, route);
		});
	}

	test('parity keeps AR lookup graceful when no automated AR match is available', async ({ request }) => {
		const response = await request.get('/api/ar?isbn=9999999999999');
		expect([200, 404]).toContain(response.status());

		const body = await response.json();
		const fallbackMessage = typeof body.error === 'string' ? body.error : '';

		expect([
			'Book not found in AR database'
		]).toContain(fallbackMessage);
	});
});
