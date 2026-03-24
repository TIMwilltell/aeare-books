import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Convert ISBN-13 to ISBN-10
 */
function isbn13to10(isbn13: string): string {
	const isbn10 = isbn13.slice(3, 12);
	const checkDigit = calculateIsbn10CheckDigit(isbn10);
	return isbn10 + checkDigit;
}

/**
 * Calculate ISBN-10 check digit
 */
function calculateIsbn10CheckDigit(base: string): string {
	let sum = 0;
	for (let i = 0; i < 9; i++) {
		sum += parseInt(base[i]) * (10 - i);
	}
	const remainder = sum % 11;
	const checkDigit = remainder === 0 ? 0 : 11 - remainder;
	return checkDigit === 10 ? 'X' : String(checkDigit);
}

/**
 * Lookup book metadata from Google Books API
 */
async function lookupGoogleBooks(isbn: string): Promise<Response> {
	const url = `${GOOGLE_BOOKS_API}?q=isbn:${isbn}`;
	return fetch(url);
}

export const GET: RequestHandler = async ({ url }) => {
	const isbn = url.searchParams.get('isbn');

	if (!isbn) {
		return json({ error: 'ISBN is required' }, { status: 400 });
	}

	// Clean the ISBN (remove hyphens and spaces)
	const cleanIsbn = isbn.replace(/[-\s]/g, '');

	let lastError = 'Book not found';

	// Try ISBN-13 first (if it looks like ISBN-13)
	if (cleanIsbn.length === 13) {
		try {
			const response = await lookupGoogleBooks(cleanIsbn);
			if (response.ok) {
				const data = await response.json();
				const book = parseGoogleBooksResponse(data);
				if (book) {
					return json(book);
				}
			}
			lastError = `ISBN-13 lookup failed: ${response.status}`;
		} catch (e) {
			lastError = 'Network error during ISBN-13 lookup';
		}
	}

	// Try ISBN-10 (convert if we had ISBN-13, or use as-is)
	let isbn10 = cleanIsbn;
	if (cleanIsbn.length === 13 && cleanIsbn.startsWith('978')) {
		isbn10 = isbn13to10(cleanIsbn);
	}

	if (isbn10.length === 10) {
		try {
			const response = await lookupGoogleBooks(isbn10);
			if (response.ok) {
				const data = await response.json();
				const book = parseGoogleBooksResponse(data);
				if (book) {
					return json(book);
				}
			}
			lastError = `ISBN-10 lookup failed: ${response.status}`;
		} catch (e) {
			lastError = 'Network error during ISBN-10 lookup';
		}
	}

	// Return 404 if both lookups failed
	return json({ error: lastError }, { status: 404 });
};

interface GoogleBooksResponse {
	totalItems: number;
	items?: Array<{
		volumeInfo: {
			title?: string;
			authors?: string[];
			imageLinks?: {
				thumbnail?: string;
				smallThumbnail?: string;
			};
		};
	}>;
}

function parseGoogleBooksResponse(data: GoogleBooksResponse) {
	if (!data.items || data.items.length === 0) {
		return null;
	}

	const volumeInfo = data.items[0].volumeInfo;

	if (!volumeInfo.title) {
		return null;
	}

	const title = volumeInfo.title;
	const author = volumeInfo.authors?.[0] || 'Unknown Author';

	// Prefer larger thumbnail, fallback to smallThumbnail
	let coverUrl: string | undefined;
	if (volumeInfo.imageLinks?.thumbnail) {
		// Convert HTTP to HTTPS if needed
		coverUrl = volumeInfo.imageLinks.thumbnail.replace(/^http:/, 'https:');
	} else if (volumeInfo.imageLinks?.smallThumbnail) {
		coverUrl = volumeInfo.imageLinks.smallThumbnail.replace(/^http:/, 'https:');
	}

	return {
		title,
		author,
		coverUrl,
		source: 'google-books' as const
	};
}
