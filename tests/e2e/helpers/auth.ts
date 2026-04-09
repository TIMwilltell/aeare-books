import { expect, type APIRequestContext, type Page } from '@playwright/test';

export const protectedRoutes = ['/scan', '/book/new', '/book/test-book-id'];

export async function clearMagicLinks(request: APIRequestContext, email: string) {
	const response = await request.delete(`/api/test/auth-email?email=${encodeURIComponent(email)}`);
	if (!response.ok()) {
		throw new Error(`Failed to clear magic links (${response.status()}): ${await response.text()}`);
	}
}

export async function pollForMagicLink(request: APIRequestContext, email: string) {
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

export function rewriteMagicLinkForLocalApp(url: string, currentPageUrl: string) {
	const magicLink = new URL(url);
	const appOrigin = new URL(currentPageUrl);
	magicLink.protocol = appOrigin.protocol;
	magicLink.hostname = appOrigin.hostname;
	magicLink.port = appOrigin.port;
	return magicLink.toString();
}

export async function signInWithLocalInbox(page: Page, request: APIRequestContext, email: string) {
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

export async function assertSignedOutRedirect(page: Page, route: string) {
	await page.goto(route);
	await expect(page).toHaveURL('/');
	await expect(page.getByText('Signed out')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Protected family reading shelves, ready when you sign in.' })).toBeVisible();
}
