import { readFile } from 'node:fs/promises';

import { expect, test, type Download, type Page } from '@playwright/test';

import {
	assertSignedOutRedirect,
	clearMagicLinks,
	protectedRoutes,
	signInWithLocalInbox
} from './helpers/auth';

interface ExportPayload {
	books: Array<{ title: string }>;
	progressEvents: Array<{ eventType: string; bookId: string; eventDate: string; createdAt: string }>;
}

async function exportLibrary(page: Page): Promise<ExportPayload> {
	const downloadPromise = page.waitForEvent('download');
	await page.getByRole('button', { name: 'Export library' }).click();
	const download = await downloadPromise;
	return await parseDownload(download);
}

async function parseDownload(download: Download): Promise<ExportPayload> {
	await expect(download.suggestedFilename()).toMatch(/^aeare-library-\d{4}-\d{2}-\d{2}\.json$/);
	const path = await download.path();
	if (!path) {
		throw new Error('Expected Playwright to provide a download path');
	}

	return JSON.parse(await readFile(path, 'utf8')) as ExportPayload;
}

async function addBook(page: Page, title: string, author: string) {
	await page.goto('/book/new');
	await page.getByLabel('Title *').fill(title);
	await page.getByLabel('Author *').fill(author);
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL('/');
	await expect(page.getByRole('button', { name: new RegExp(title, 'i') }).first()).toBeVisible();
}

test('phase 5 protected routes still redirect while signed out', async ({ page }) => {
	for (const route of protectedRoutes) {
		await assertSignedOutRedirect(page, route);
	}
});

test('library timeline and export stay isolated between two signed-in users', async ({ page, request }) => {
	const userAEmail = `route-owner-a+${Date.now()}@example.com`;
	const userBEmail = `route-owner-b+${Date.now()}@example.com`;
	const title = 'Route Ownership Diary';
	const author = 'Phase Five';

	try {
		await page.goto('/');
		await signInWithLocalInbox(page, request, userAEmail);
		await addBook(page, title, author);

		await page.getByRole('button', { name: new RegExp(title, 'i') }).first().click();
		await expect(page.getByRole('heading', { name: title })).toBeVisible();
		await expect(page.getByText('Book added to library')).toBeVisible();

		await page.goto('/');
		const userAExport = await exportLibrary(page);
		await expect(userAExport.books).toHaveLength(1);
		await expect(userAExport.progressEvents.length).toBeGreaterThanOrEqual(1);
		expect(userAExport.books[0]?.title).toBe(title);
		expect(
			userAExport.progressEvents.some((event) => {
				return event.eventType === 'book_added' && event.eventDate.endsWith('Z') && event.createdAt.endsWith('Z');
			})
		).toBe(true);

		await page.getByRole('button', { name: 'Sign out' }).click();
		await expect(page.getByText('Signed out')).toBeVisible();

		await signInWithLocalInbox(page, request, userBEmail);
		await expect(page.getByRole('heading', { name: 'Your library is empty.' })).toBeVisible();
		await expect(page.getByRole('button', { name: new RegExp(title, 'i') })).toHaveCount(0);

		const userBExport = await exportLibrary(page);
		expect(userBExport.books).toEqual([]);
		expect(userBExport.progressEvents).toEqual([]);
	} finally {
		await clearMagicLinks(request, userAEmail);
		await clearMagicLinks(request, userBEmail);
	}
});
