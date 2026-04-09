import { expect, test } from '@playwright/test';

import { assertSignedOutRedirect, clearMagicLinks, protectedRoutes, signInWithLocalInbox } from './helpers/auth';

test('public home remains available while signed out', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByText('Signed out')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Protected family reading shelves, ready when you sign in.' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Sign in to start' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Sign in to open your family shelf.' })).toBeVisible();
	await expect(page.getByLabel('Search by title or author')).toHaveCount(0);
	await expect(page).toHaveURL('/');
});

for (const route of protectedRoutes) {
	test(`signed-out users are redirected away from ${route}`, async ({ page }) => {
		await assertSignedOutRedirect(page, route);
	});
}

test('local auth inbox completes a full magic-link sign-in flow', async ({ page, request }) => {
	const testEmail = `reader+${Date.now()}@example.com`;
	await page.goto('/');
	await signInWithLocalInbox(page, request, testEmail);

	await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'A warmer home for every book you track.' })).toBeVisible();
	await expect(page.getByLabel('Search by title or author')).toBeVisible();

	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Export library' }).click();
	const download = await downloadPromise;
	await expect(download.suggestedFilename()).toMatch(/^aeare-library-\d{4}-\d{2}-\d{2}\.json$/);

	await page.goto('/book/new');
	await expect(page).toHaveURL('/book/new');
	await expect(page.getByRole('heading', { name: 'Add a book to the shelf.' })).toBeVisible();

	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page.getByText('Signed out')).toBeVisible();

	await page.goto('/book/new');
	await expect(page).toHaveURL('/');

	await clearMagicLinks(request, testEmail);
});

test('signed-out users return to /scan after local sign-in', async ({ page, request }) => {
	const testEmail = `scan-reader+${Date.now()}@example.com`;
	await page.goto('/scan');

	await expect(page).toHaveURL('/');
	await expect(page.getByText('Sign in and we will return you to the scanner.')).toBeVisible();

	await signInWithLocalInbox(page, request, testEmail);

	await expect(page).toHaveURL('/scan');
	await expect(page.getByRole('heading', { name: 'Scan the next book into your reading circle.' })).toBeVisible();
	await clearMagicLinks(request, testEmail);
});

test('signed-out users return to a protected book detail after local sign-in', async ({ page, request }) => {
	const testEmail = `detail-reader+${Date.now()}@example.com`;
	await page.goto('/');
	await signInWithLocalInbox(page, request, testEmail);

	await page.goto('/book/new');
	await page.getByLabel('Title *').fill('Phase 3 Redirect Book');
	await page.getByLabel('Author *').fill('Migration Test');
	await page.getByRole('button', { name: 'Save book' }).click();

	await expect(page).toHaveURL('/');
	const bookCard = page.getByRole('button', { name: /Phase 3 Redirect Book/i }).first();
	await expect(bookCard).toBeVisible();
	await bookCard.click();
	await expect(page.getByRole('heading', { name: 'Phase 3 Redirect Book' })).toBeVisible();
	const detailUrl = page.url();

	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page.getByText('Signed out')).toBeVisible();

	await page.goto(detailUrl);
	await expect(page).toHaveURL('/');
	await expect(page.getByText('Sign in and we will return you to that book.')).toBeVisible();

	await signInWithLocalInbox(page, request, testEmail);

	await expect(page).toHaveURL(detailUrl);
	await expect(page.getByRole('heading', { name: 'Phase 3 Redirect Book' })).toBeVisible();
	await clearMagicLinks(request, testEmail);
});
