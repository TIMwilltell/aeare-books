import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import puppeteer from '@cloudflare/puppeteer';
import { getArCache, setArCache } from '$lib/db';
import type { ArSource } from '$lib/types/ar';
const ARBOOKFIND_COOLDOWN_MS = 6 * 60 * 60 * 1000;
const arbookfindCooldownByIsbn = new Map<string, number>();
type BrowserBinding = NonNullable<App.Platform['env']>['BROWSER'];

export const GET: RequestHandler = async ({ url, platform }) => {
	const isbn = url.searchParams.get('isbn');

	if (!isbn) {
		return json({ error: 'ISBN required' }, { status: 400 });
	}

	// Clean ISBN (remove hyphens and spaces)
	const cleanIsbn = isbn.replace(/[-\s]/g, '').toUpperCase();
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
	let arLevel = bookrooResult?.arLevel;
	let arPoints = bookrooResult?.arPoints;
	let source: ArSource | null = bookrooResult ? 'bookroo' : null;

	const needsFallback = arLevel === undefined || arPoints === undefined;
	if (needsFallback) {
		if (isArbookfindInCooldown(cleanIsbn)) {
			if (arLevel !== undefined || arPoints !== undefined) {
				return json({ arLevel, arPoints, source: source ?? 'bookroo' });
			}
			return json({ error: 'AR fallback temporarily unavailable for this ISBN' }, { status: 503 });
		}

		const scrapeResult = await scrapeArBookFindWithBrowser(cleanIsbn, platform?.env?.BROWSER);
		if (scrapeResult.notFound) {
			markArbookfindCooldown(cleanIsbn);
			if (arLevel !== undefined || arPoints !== undefined) {
				return json({ arLevel, arPoints, source: source ?? 'bookroo' });
			}
			return json({ error: scrapeResult.error ?? 'Book not found in AR database' }, { status: 404 });
		}

		if (scrapeResult.error) {
			if (arLevel !== undefined || arPoints !== undefined) {
				return json({ arLevel, arPoints, source: source ?? 'bookroo' });
			}
			return json({ error: scrapeResult.error }, { status: 503 });
		}

		if (arLevel === undefined) {
			arLevel = scrapeResult.arLevel;
		}
		if (arPoints === undefined) {
			arPoints = scrapeResult.arPoints;
		}

		if (scrapeResult.arLevel !== undefined || scrapeResult.arPoints !== undefined) {
			source = source ?? 'scrape';
		}
	}

	if (arLevel !== undefined && arPoints !== undefined) {
		await setArCache(cleanIsbn, arLevel, arPoints);
	}

	if (arLevel !== undefined || arPoints !== undefined) {
		return json({ arLevel, arPoints, source: source ?? 'scrape' });
	}

	return json({ error: 'Book not found in AR database' }, { status: 404 });
};

async function scrapeArBookFindWithBrowser(isbn: string, browserBinding: BrowserBinding | undefined): Promise<ScrapeResult> {
	if (!browserBinding) {
		return { error: 'AR fallback is unavailable until the Cloudflare Browser Rendering binding is configured.' };
	}

	try {
		const browser = await puppeteer.launch(browserBinding as any);

		try {
			const page = await browser.newPage();
			page.setDefaultTimeout(7000);
			page.setDefaultNavigationTimeout(10000);
			await (page as any).route('**/*', (route: any) => {
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

			return await scrapeArBookFind(page, isbn);
		} finally {
			await browser.close();
		}
	} catch (error) {
		console.error('AR scrape error:', error);
		return { error: 'AR lookup failed' };
	}
}

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
	notFound?: boolean;
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
			return { notFound: true, error: 'Book not found in AR database' };
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
		const searchResponse = await fetchWithTimeout(
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

		const normalizedIsbn = isbn.replace(/[-\s]/g, '').toUpperCase();
		const matchedBook = books.find((book: any) => {
			const candidate = String(book?.isbn ?? '')
				.replace(/[-\s]/g, '')
				.toUpperCase();
			return candidate === normalizedIsbn;
		});
		if (!matchedBook?.slug) {
			return null;
		}

		const detailsResponse = await fetchWithTimeout(
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

async function fetchWithTimeout(input: string, timeoutMs = 10000): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		return await fetch(input, { signal: controller.signal });
	} finally {
		clearTimeout(timeoutId);
	}
}
