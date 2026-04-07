import { expect, test, type APIRequestContext } from '@playwright/test';

const protectedRoutes = ['/scan', '/book/new', '/book/test-book-id'];

async function clearMagicLinks(request: APIRequestContext, email: string) {
	const response = await request.delete(`/api/test/auth-email?email=${encodeURIComponent(email)}`);
	if (!response.ok()) {
		throw new Error(`Failed to clear magic links (${response.status()}): ${await response.text()}`);
	}
}

async function pollForMagicLink(request: APIRequestContext, email: string) {
	for (let attempt = 0; attempt < 20; attempt += 1) {
		const response = await request.get(`/api/test/auth-email?email=${encodeURIComponent(email)}`);
		if (!response.ok()) {
			throw new Error(`Magic link inbox request failed (${response.status()}): ${await response.text()}`);
		}

		const body = await response.json();
		if (body.latest?.url) {
			return body.latest.url as string;
		}
		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	throw new Error(`Timed out waiting for magic link for ${email}`);
}

function rewriteMagicLinkForLocalApp(url: string, currentPageUrl: string) {
	const magicLink = new URL(url);
	const appOrigin = new URL(currentPageUrl);
	magicLink.protocol = appOrigin.protocol;
	magicLink.hostname = appOrigin.hostname;
	magicLink.port = appOrigin.port;
	return magicLink.toString();
}

async function signInWithLocalInbox(page: import('@playwright/test').Page, request: APIRequestContext, email: string) {
	await clearMagicLinks(request, email);
	await page.evaluate((promptEmail) => {
		window.prompt = () => promptEmail;
	}, email);
	await page.getByRole('button', { name: 'Sign in', exact: true }).click();

	const magicLink = await pollForMagicLink(request, email);
	await page.goto('/dev/inbox');
	await page.getByLabel('Email address').fill(email);
	await page.getByRole('button', { name: 'Load latest message' }).click();
	await expect(page.getByText('Latest message')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Open local magic link' })).toBeVisible();
	await page.goto(rewriteMagicLinkForLocalApp(magicLink, page.url()));
	await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
}

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
		await page.goto(route);

		await expect(page).toHaveURL('/');
		await expect(page.getByText('Signed out')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Protected family reading shelves, ready when you sign in.' })).toBeVisible();
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
