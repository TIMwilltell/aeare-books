import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getArCache, setArCache } from '$lib/db';

// Playwright will be imported dynamically to avoid issues when not needed
let playwright: typeof import('playwright') | null = null;

async function getPlaywright() {
	if (!playwright) {
		playwright = await import('playwright');
	}
	return playwright;
}

export const GET: RequestHandler = async ({ url }) => {
	const isbn = url.searchParams.get('isbn');

	if (!isbn) {
		return json({ error: 'ISBN required' }, { status: 400 });
	}

	// Clean ISBN (remove hyphens and spaces)
	const cleanIsbn = isbn.replace(/[-\s]/g, '');

	// Check cache first
	const cached = await getArCache(cleanIsbn);
	if (cached) {
		return json({
			arLevel: cached.arLevel,
			arPoints: cached.arPoints,
			source: 'cache'
		});
	}

	// Scrape with Playwright
	try {
		const pw = await getPlaywright();
		const browser = await pw.chromium.launch({ headless: true });
		const page = await browser.newPage();

		const result = await scrapeArBookFind(page, cleanIsbn);
		await browser.close();

		if (result.error) {
			return json({ error: result.error }, { status: 404 });
		}

		// Cache successful result
		if (result.arLevel !== undefined && result.arPoints !== undefined) {
			await setArCache(cleanIsbn, result.arLevel, result.arPoints);
		}

		return json({
			arLevel: result.arLevel,
			arPoints: result.arPoints,
			source: 'scrape'
		});
	} catch (error) {
		console.error('AR scrape error:', error);
		return json({ error: 'AR lookup failed' }, { status: 503 });
	}
};

interface ScrapeResult {
	arLevel?: number;
	arPoints?: number;
	error?: string;
}

async function scrapeArBookFind(page: any, isbn: string): Promise<ScrapeResult> {
	try {
		// Navigate to UserType.aspx
		await page.goto('https://www.arbookfind.com/UserType.aspx?RedirectURL=%2fadvanced.aspx');

		// Click Librarian radio and submit
		await page.click('#radLibrarian');
		await page.click('#btnSubmitUserType');

		// Wait for ISBN input
		await page.waitForSelector('#ctl00_ContentPlaceHolder1_txtISBN');

		// Type ISBN and search
		await page.fill('#ctl00_ContentPlaceHolder1_txtISBN', isbn);
		await page.click('#ctl00_ContentPlaceHolder1_btnDoIt');

		await page.waitForLoadState('domcontentloaded');

		// Check for failure message
		const failLocator = page.locator('#ctl00_ContentPlaceHolder1_lblSearchResultFailedLabel');
		if (await failLocator.count() > 0) {
			return { error: 'Book not found in AR database' };
		}

		// Click on book title
		await page.waitForSelector('#book-title');
		await page.click('#book-title');

		// Extract AR data
		const atosStr = await page.textContent('#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookLevel');
		const arPointsStr = await page.textContent('#ctl00_ContentPlaceHolder1_ucBookDetail_lblPoints');

		const arLevel = parseFloat(atosStr || '') || undefined;
		const arPoints = parseFloat(arPointsStr || '') || undefined;

		if (arLevel === undefined && arPoints === undefined) {
			return { error: 'Could not parse AR data' };
		}

		return { arLevel, arPoints };
	} catch (e) {
		return { error: `Scrape failed: ${e}` };
	}
}
