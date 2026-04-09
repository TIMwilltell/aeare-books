import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getArCache, setArCache } from '$lib/db';
import type { ArSource } from '$lib/types/ar';

export const GET: RequestHandler = async ({ url }) => {
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

	if (arLevel !== undefined && arPoints !== undefined) {
		await setArCache(cleanIsbn, arLevel, arPoints);
	}

	if (arLevel !== undefined || arPoints !== undefined) {
		return json({ arLevel, arPoints, source: source ?? 'bookroo' });
	}

	return json({ error: 'Book not found in AR database' }, { status: 404 });
};

interface BookrooResult {
	arLevel?: number;
	arPoints?: number;
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
