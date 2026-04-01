import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getArCache, setArCache } from '$lib/db';

// Playwright will be imported dynamically to avoid issues when not needed
let playwright: typeof import('playwright') | null = null;
const ARBOOKFIND_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const arbookfindCooldownByIsbn = new Map<string, number>();

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
	if (!/^(\d{13}|\d{9}[\dXx])$/.test(cleanIsbn)) {
		return json({ error: 'Invalid ISBN format' }, { status: 400 });
	}

	// Check cache first
	const cached = await getArCache(cleanIsbn);
	if (cached) {
		return json({
			arLevel: cached.arLevel,
			arPoints: cached.arPoints,
			source: 'cache'
		});
	}

	const bookrooResult = await lookupArFromBookroo(cleanIsbn);
	if (bookrooResult && (bookrooResult.arLevel !== undefined || bookrooResult.arPoints !== undefined)) {
		if (bookrooResult.arLevel !== undefined && bookrooResult.arPoints !== undefined) {
			await setArCache(cleanIsbn, bookrooResult.arLevel, bookrooResult.arPoints);
		}

		return json({
			arLevel: bookrooResult.arLevel,
			arPoints: bookrooResult.arPoints,
			source: 'bookroo'
		});
	}

	if (isArbookfindInCooldown(cleanIsbn)) {
		return json({ error: 'AR fallback temporarily unavailable for this ISBN' }, { status: 503 });
	}

	// Scrape with Playwright
	try {
		const pw = await getPlaywright();
		const browser = await pw.chromium.launch({ headless: true });

		try {
			const page = await browser.newPage();
			page.setDefaultTimeout(7000);
			page.setDefaultNavigationTimeout(10000);
			await page.route('**/*', (route) => {
				const resourceType = route.request().resourceType();
				if (
					resourceType === 'image' ||
					resourceType === 'font' ||
					resourceType === 'media' ||
					resourceType === 'stylesheet'
				) {
					void route.abort();
					return;
				}
				void route.continue();
			});

			const result = await scrapeArBookFind(page, cleanIsbn);

			if (result.error) {
				markArbookfindCooldown(cleanIsbn);
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
		} finally {
			await browser.close();
		}
	} catch (error) {
		markArbookfindCooldown(cleanIsbn);
		console.error('AR scrape error:', error);
		return json({ error: 'AR lookup failed' }, { status: 503 });
	}
};

function isArbookfindInCooldown(isbn: string): boolean {
	const retryAfter = arbookfindCooldownByIsbn.get(isbn);
	if (!retryAfter) {
		return false;
	}
	if (Date.now() >= retryAfter) {
		arbookfindCooldownByIsbn.delete(isbn);
		return false;
	}
	return true;
}

function markArbookfindCooldown(isbn: string): void {
	arbookfindCooldownByIsbn.set(isbn, Date.now() + ARBOOKFIND_COOLDOWN_MS);
}

interface ScrapeResult {
	arLevel?: number;
	arPoints?: number;
	error?: string;
}

interface BookrooResult {
	arLevel?: number;
	arPoints?: number;
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

async function lookupArFromBookroo(isbn: string): Promise<BookrooResult | null> {
	try {
		const searchResponse = await fetch(
			`https://auth.bookroo.com/api/search/books-dynamic?query=${encodeURIComponent(isbn)}`
		);
		if (!searchResponse.ok) {
			return null;
		}
		const searchPayload = await searchResponse.json();
		const books = searchPayload?.data?.books;
		if (!Array.isArray(books) || books.length === 0) {
			return null;
		}

		const normalizedIsbn = isbn.replace(/[-\s]/g, '');
		const matchedBook = books.find((book: any) => {
			const candidate = String(book?.isbn ?? '').replace(/[-\s]/g, '');
			return candidate === normalizedIsbn;
		});
		if (!matchedBook?.slug) {
			return null;
		}

		const detailsResponse = await fetch(
			`https://bookroo.com/books/${matchedBook.slug}?isbn=${encodeURIComponent(isbn)}`
		);
		if (!detailsResponse.ok) {
			return null;
		}

		const html = await detailsResponse.text();
		const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json"[^>]*>([\s\S]*?)<\/script>/);
		if (!nextDataMatch?.[1]) {
			return null;
		}

		const parsed = JSON.parse(nextDataMatch[1]);
		const pageProps = parsed?.props?.pageProps ?? parsed?.pageProps;
		const book = pageProps?.book;
		if (!book) {
			return null;
		}

		const arLevel = typeof book.atos?.value === 'number' ? book.atos.value : undefined;
		const arPoints = typeof book.ar_points === 'number' ? book.ar_points : undefined;

		if (arLevel === undefined && arPoints === undefined) {
			return null;
		}

		return { arLevel, arPoints };
	} catch {
		return null;
	}
}
