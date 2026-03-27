import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getArCache, setArCache } from '$lib/db';
import puppeteer from '@cloudflare/puppeteer';

interface Env {
	MYBROWSER: any;
}

const SESSION_CONNECT_RETRIES = 1;
const SESSION_CONNECT_RETRY_DELAY_MS = 1200;
const SESSION_CONNECT_TIMEOUT_MS = 7000;
const SESSION_READY_DELAY_MS = 1500;

export const GET: RequestHandler = async ({ url, platform }) => {
	const isbn = url.searchParams.get('isbn');

	if (!isbn) {
		return json({ error: 'ISBN required' }, { status: 400 });
	}

	const cleanIsbn = isbn.replace(/[-\s]/g, '');

	const cached = await getArCache(cleanIsbn);
	if (cached) {
		return json({
			arLevel: cached.arLevel,
			arPoints: cached.arPoints,
			source: 'cache'
		});
	}

	const env = platform?.env as Env | undefined;
	const browserFetcher = env?.MYBROWSER;

	if (!browserFetcher) {
		return json({
			error: 'AR lookup requires Cloudflare Workers with Browser Rendering enabled'
		}, { status: 503 });
	}

	let browser: any = null;
	try {
		browser = await launchBrowserWithRetries(browserFetcher, cleanIsbn);
		console.log('Browser launched');

		const page = await browser.newPage();
		console.log('New page created');

		const result = await scrapeArBookFind(page, cleanIsbn);
		console.log('Scrape result:', result);

		if (result.error) {
			return json({ error: result.error }, { status: 404 });
		}

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
		const errorMessage = error instanceof Error ? error.message : String(error);
		return json({ error: `AR lookup failed: ${errorMessage}` }, { status: 503 });
	} finally {
		if (browser) {
			try {
				await browser.close();
			} catch (closeError) {
				console.error('Failed to close browser session:', closeError);
			}
		}
	}
};

interface ScrapeResult {
	arLevel?: number;
	arPoints?: number;
	error?: string;
}

async function scrapeArBookFind(page: any, isbn: string): Promise<ScrapeResult> {
	const timeout = 30000;
	try {
		console.log('Navigating to arbookfind.com for ISBN:', isbn);
		await page.goto('https://www.arbookfind.com/UserType.aspx?RedirectURL=%2fadvanced.aspx', {
			timeout,
			waitUntil: 'domcontentloaded'
		});

		console.log('Clicking Librarian option');
		await page.waitForSelector('#radLibrarian', { timeout });
		await page.click('#radLibrarian', { timeout });
		await Promise.all([
			page.waitForNavigation({ timeout, waitUntil: 'domcontentloaded' }),
			page.click('#btnSubmitUserType', { timeout })
		]);

		console.log('Waiting for ISBN input');
		await page.waitForSelector('#ctl00_ContentPlaceHolder1_txtISBN', { timeout });

		console.log('Filling ISBN');
		await page.type('#ctl00_ContentPlaceHolder1_txtISBN', isbn);
		await page.click('#ctl00_ContentPlaceHolder1_btnDoIt', { timeout });

		await Promise.race([
			page.waitForSelector('#ctl00_ContentPlaceHolder1_lblSearchResultFailedLabel', { timeout }),
			page.waitForSelector('#book-title', { timeout })
		]);

		const failElement = await page.$('#ctl00_ContentPlaceHolder1_lblSearchResultFailedLabel');
		if (failElement) {
			return { error: 'Book not found in AR database' };
		}

		console.log('Waiting for book title');
		await Promise.all([
			page.waitForNavigation({ timeout, waitUntil: 'domcontentloaded' }),
			page.click('#book-title', { timeout })
		]);

		console.log('Extracting AR data');
		await page.waitForSelector('#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookLevel', { timeout });
		await page.waitForSelector('#ctl00_ContentPlaceHolder1_ucBookDetail_lblPoints', { timeout });

		const atosStr = await page.$eval(
			'#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookLevel',
			(el: Element) => el.textContent?.trim() ?? ''
		);
		const arPointsStr = await page.$eval(
			'#ctl00_ContentPlaceHolder1_ucBookDetail_lblPoints',
			(el: Element) => el.textContent?.trim() ?? ''
		);

		const arLevel = parseNumericValue(atosStr);
		const arPoints = parseNumericValue(arPointsStr);

		if (arLevel === undefined && arPoints === undefined) {
			return { error: 'Could not parse AR data' };
		}

		return { arLevel, arPoints };
	} catch (e) {
		console.error('Scrape error:', e);
		const errorMsg = e instanceof Error ? e.message : String(e);
		if (errorMsg.includes('Timeout')) {
			return { error: 'AR lookup timed out' };
		}
		return { error: `Scrape failed: ${errorMsg}` };
	}
}

async function launchBrowserWithRetries(browserFetcher: any, isbn: string): Promise<any> {
	const maxLaunchRetries = 4;
	let lastError: unknown;

	for (let launchAttempt = 0; launchAttempt <= maxLaunchRetries; launchAttempt++) {
		try {
			console.log(`Acquiring browser session for ISBN: ${isbn} (attempt ${launchAttempt + 1})`);
			const session = await puppeteer.acquire(browserFetcher, { keep_alive: 120000 });
			console.log(`Acquired browser session ${session.sessionId}`);
			await sleep(SESSION_READY_DELAY_MS);

			return await connectSessionWithRetries(browserFetcher, session.sessionId);
		} catch (error) {
			lastError = error;
			console.error(`Browser launch attempt ${launchAttempt + 1} failed:`, error);

			if (launchAttempt === maxLaunchRetries) {
				break;
			}

			await sleep(2000);
		}
	}

	throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function connectSessionWithRetries(browserFetcher: any, sessionId: string): Promise<any> {
	for (let connectAttempt = 0; connectAttempt < SESSION_CONNECT_RETRIES; connectAttempt++) {
		try {
			if (connectAttempt > 0) {
				console.log(`Retrying connection for session ${sessionId} (attempt ${connectAttempt + 1})`);
			}
			console.log(`Connecting to browser session ${sessionId}`);

			return await withTimeout(
				puppeteer.connect(browserFetcher, sessionId),
				SESSION_CONNECT_TIMEOUT_MS,
				`Timed out connecting to browser session ${sessionId}`
			);
		} catch (error) {
			if (connectAttempt === SESSION_CONNECT_RETRIES - 1) {
				throw error;
			}

			await sleep(SESSION_CONNECT_RETRY_DELAY_MS * (connectAttempt + 1));
		}
	}

	throw new Error(`Unable to connect to browser session ${sessionId}`);
}

function parseNumericValue(value: string | null | undefined): number | undefined {
	if (!value) {
		return undefined;
	}

	const match = value.match(/\d+(?:\.\d+)?/);
	if (!match) {
		return undefined;
	}

	const parsed = Number.parseFloat(match[0]);
	return Number.isNaN(parsed) ? undefined : parsed;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	try {
		const timeoutPromise = new Promise<never>((_, reject) => {
			timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
		});

		return await Promise.race([promise, timeoutPromise]);
	} finally {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	}
}
