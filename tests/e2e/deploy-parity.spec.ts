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

		if (response.status() === 404) {
			expect([
				'Book not found in AR database'
			]).toContain(fallbackMessage);
			return;
		}

		expect(response.status()).toBe(200);
		expect(body).toEqual(
			expect.objectContaining({
				source: expect.stringMatching(/^(cache|bookroo)$/)
			})
		);
		expect(typeof body.arLevel === 'number' || typeof body.arPoints === 'number').toBe(true);
	});
});
