import { expect, test } from '@playwright/test';

import { clearMagicLinks, signInWithLocalInbox } from './helpers/auth';

test('repeat sign-in and reload stay pinned to the same internal user mapping', async ({ page, request }) => {
	const testEmail = `identity-reader+${Date.now()}@example.com`;
	await page.goto('/?authAudit=1');
	await signInWithLocalInbox(page, request, testEmail);

	const firstUserId = await page.getByTestId('auth-current-user-id').textContent();
	await expect(page.getByTestId('auth-current-user-email')).toHaveText(testEmail);

	await page.reload();
	await expect(page.getByTestId('auth-current-user-id')).toHaveText(firstUserId ?? '');

	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
	await expect(page.getByTestId('auth-audit')).toHaveCount(0);

	await signInWithLocalInbox(page, request, testEmail);
	await expect(page.getByTestId('auth-current-user-id')).toHaveText(firstUserId ?? '');
	await expect(page.getByTestId('auth-current-user-email')).toHaveText(testEmail);

	await clearMagicLinks(request, testEmail);
});

test('refresh-token failure clears shell auth state and falls back to signed-out routing', async ({ page, request }) => {
	const testEmail = `refresh-reader+${Date.now()}@example.com`;

	await page.goto('/?authAudit=1');
	await signInWithLocalInbox(page, request, testEmail);

	const refreshedToken = await page.evaluate(async () => {
		return await window.__aeareTestAuth?.forceRefreshFailure();
	});
	expect(refreshedToken).toBeNull();

	await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Sign out' })).toHaveCount(0);
	await expect(page.getByText('Your session expired. Sign in again to continue.')).toBeVisible();
	await expect(page.getByTestId('auth-audit')).toHaveCount(0);

	await page.goto('/scan');
	await expect(page).toHaveURL('/');
	await expect(page.getByText('Sign in and we will return you to the scanner.')).toBeVisible();

	await clearMagicLinks(request, testEmail);
});
