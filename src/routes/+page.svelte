<script lang="ts">
	import { goto } from '$app/navigation';
	import { authState, rememberProtectedRouteIntent, signIn } from '$lib/auth/auth0';
	import { getAllBooks, searchBooks, type Book } from '$lib/db';
	import { exportLibrary } from '$lib/api/export';
	import BookList from '$lib/components/BookList.svelte';
	import FAB from '$lib/components/FAB.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { onMount } from 'svelte';

	let books = $state<Book[]>([]);
	let searchQuery = $state('');
	let loading = $state(true);
	let libraryError = $state<string | null>(null);
	let requestId = 0;
	let isSignedIn = $derived($authState.status === 'signed-in');

	let totalBooks = $derived(books.length);
	let arPointsTotal = $derived(
		books.reduce((sum, book) => sum + (typeof book.arPoints === 'number' ? book.arPoints : 0), 0)
	);

	async function loadBooks() {
		const currentRequestId = ++requestId;
		loading = true;
		libraryError = null;

		try {
			const allBooks = await getAllBooks();
			if (currentRequestId !== requestId) {
				return;
			}
			books = allBooks;
		} catch (error) {
			if (currentRequestId !== requestId) {
				return;
			}
			books = [];
			libraryError = error instanceof Error ? error.message : 'Failed to load your library.';
			console.error('Failed to load books:', error);
		} finally {
			if (currentRequestId === requestId) {
				loading = false;
			}
		}
	}

	onMount(() => {
		void loadBooks();

		const unsubscribe = authState.subscribe((state) => {
			void syncLibraryState(state.status);
		});

		return unsubscribe;
	});

	async function syncLibraryState(authStatus: 'loading' | 'signed-out' | 'signed-in' | 'error') {
		if (authStatus === 'loading') {
			loading = true;
			return;
		}

		if (authStatus !== 'signed-in') {
			requestId += 1;
			books = [];
			searchQuery = '';
			libraryError = null;
			loading = false;
			return;
		}

		void loadBooks();
	}

	async function handleSearch() {
		if (!isSignedIn || loading) {
			return;
		}

		const currentRequestId = ++requestId;
		libraryError = null;

		try {
			const results = await searchBooks(searchQuery);
			if (currentRequestId !== requestId) {
				return;
			}
			books = results;
		} catch (error) {
			if (currentRequestId !== requestId) {
				return;
			}
			libraryError = error instanceof Error ? error.message : 'Search failed. Please try again.';
			console.error('Failed to search books:', error);
		}
	}

	async function handleRetryLibrary() {
		if (!isSignedIn) {
			return;
		}

		if (searchQuery.trim()) {
			await handleSearch();
			return;
		}

		await loadBooks();
	}

	function handleBookSelect(id: string) {
		goto(`/book/${id}`);
	}

	async function handleScan() {
		if (!isSignedIn) {
			rememberProtectedRouteIntent('/scan');
			await signIn();
			return;
		}

		goto('/scan');
	}

	async function handleExport() {
		if (!isSignedIn || loading) {
			return;
		}

		try {
			await exportLibrary();
		} catch (error) {
			console.error('Export failed:', error);
			alert('Could not export your library. Try again.');
		}
	}
</script>

<svelte:head>
	<title>AeAre Books</title>
</svelte:head>

<div class="library-page">
	<section class="hero section-card">
		<div class="hero-copy">
			<p class="eyebrow">{isSignedIn ? 'Your library' : 'Welcome'}</p>
			<h1 class="page-title">
				{isSignedIn ? 'A warmer home for every book you track.' : 'Protected family reading shelves, ready when you sign in.'}
			</h1>
			<p class="hero-text">
				{#if isSignedIn}
					Search your shelf, export your records, and manage your catalog in one calm, mobile-first dashboard.
				{:else}
					Sign in to open your private library, scan books, and keep each account's reading history scoped to the right family.
				{/if}
			</p>
		</div>

		{#if isSignedIn}
			<div class="hero-stats" aria-label="Library summary">
				<div class="stat surface-muted">
					<span class="stat-value">{totalBooks}</span>
					<span class="stat-label">Books shelved</span>
				</div>
				<div class="stat surface-muted">
					<span class="stat-value">{arPointsTotal.toFixed(1)}</span>
					<span class="stat-label">AR points logged</span>
				</div>
			</div>
		{:else}
			<div class="signed-out-note surface-muted">
				<p>Public home stays open, but book data and task flows unlock only after authentication completes.</p>
			</div>
		{/if}

		<div class="hero-actions">
			<button class="primary-button action-scan" onclick={handleScan}>
				{isSignedIn ? 'Scan a book' : 'Sign in to start'}
			</button>
			{#if isSignedIn}
				<button class="ghost-button" onclick={handleExport}>
					Export library
				</button>
			{/if}
		</div>
	</section>

	{#if isSignedIn}
		<section class="controls section-card" aria-label="Search and actions">
			<label class="search-bar" for="library-search">
				<input
					id="library-search"
					type="search"
					aria-label="Search by title or author"
					placeholder="Search by title or author"
					bind:value={searchQuery}
					disabled={loading}
					oninput={handleSearch}
				/>
			</label>
			<button class="ghost-button export-inline" onclick={handleExport} disabled={loading}>Export</button>
		</section>

		{#if libraryError}
			<section class="section-card library-error" role="alert">
				<div>
					<p class="eyebrow">Library issue</p>
					<h2>{searchQuery.trim() ? 'Search is temporarily unavailable.' : 'We could not load your shelf.'}</h2>
					<p>{libraryError}</p>
				</div>
				<button class="ghost-button" type="button" onclick={handleRetryLibrary}>Try again</button>
			</section>
		{/if}
	{/if}

	{#if $authState.status === 'loading' || (isSignedIn && loading && books.length === 0)}
		<section class="loading-state section-card" aria-live="polite">
			<LoadingSpinner size="large" color="var(--color-coral-1)" />
			<div>
				<h2>{$authState.status === 'loading' ? 'Checking your library access…' : 'Settling your shelf…'}</h2>
				<p>
					{$authState.status === 'loading'
						? 'We are restoring your session before loading private shelf data.'
						: 'We’re gathering your books and catalog details.'}
				</p>
			</div>
		</section>
	{:else if !isSignedIn}
		<section class="empty-state section-card">
			<div class="empty-illustration" aria-hidden="true">Library</div>
			<h2>Sign in to open your family shelf.</h2>
			<p>Your home page stays available here, while scan, add, and detail routes stay protected until you authenticate.</p>
			<button class="secondary-button" onclick={handleScan}>Sign in and continue</button>
		</section>
	{:else if !libraryError && books.length === 0}
		<section class="empty-state section-card">
			<div class="empty-illustration" aria-hidden="true">Library</div>
			<h2>Your library is empty.</h2>
			<p>Scan a barcode or add a book by hand.</p>
			<button class="secondary-button" onclick={handleScan}>Scan your first book</button>
		</section>
	{:else}
		<section class="collection-header">
			<div>
				<p class="eyebrow">Library</p>
				<h2>Your library</h2>
			</div>
			<p>{books.length} book{books.length === 1 ? '' : 's'}</p>
		</section>

		<BookList {books} onSelect={handleBookSelect} />
	{/if}

	{#if isSignedIn}
		<FAB onclick={handleScan} />
	{/if}
</div>

<style>
	.library-page {
		display: grid;
		gap: 1rem;
	}

	.hero {
		position: relative;
		display: grid;
		gap: 1.2rem;
		padding: 1.35rem;
	}

	.hero-copy,
	.hero-actions,
	.hero-stats {
		position: relative;
		z-index: 1;
	}

	.hero-text {
		margin: 0;
		max-width: 34rem;
		font-size: 1rem;
		line-height: 1.6;
		color: var(--text-default);
	}

	.hero-stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.stat {
		display: grid;
		gap: 0.25rem;
		padding: 0.95rem;
	}

	.stat-value {
		font-family: var(--font-serif);
		font-size: 1.6rem;
		color: var(--text-strong);
	}

	.stat-label {
		font-size: 0.82rem;
		color: var(--text-muted);
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.signed-out-note {
		padding: 0.95rem;
	}

	.signed-out-note p {
		margin: 0;
		line-height: 1.6;
	}

	.action-scan {
		min-width: min(100%, 14rem);
	}

	.controls {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.75rem;
		padding: 0.95rem;
	}

	.search-bar {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-bar input {
		padding-left: 1rem;
	}

	.export-inline {
		min-width: 6rem;
	}

	.collection-header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.35rem 0.1rem 0;
	}

	.collection-header h2,
	.collection-header p {
		margin: 0;
	}

	.collection-header h2 {
		font-family: var(--font-serif);
		font-size: 1.5rem;
		color: var(--text-strong);
	}

	.collection-header p {
		font-size: 0.92rem;
		color: var(--text-muted);
	}

	.library-error {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid rgba(185, 85, 71, 0.25);
	}

	.library-error h2,
	.library-error p {
		margin: 0;
	}

	.library-error div {
		display: grid;
		gap: 0.35rem;
	}

	.loading-state,
	.empty-state {
		display: grid;
		justify-items: center;
		gap: 0.85rem;
		padding: 2rem 1.35rem;
		text-align: center;
	}

	.loading-state h2,
	.loading-state p,
	.empty-state h2,
	.empty-state p {
		margin: 0;
	}

	.loading-state h2,
	.empty-state h2 {
		font-family: var(--font-serif);
		font-size: 1.7rem;
		color: var(--text-strong);
	}

	.loading-state p,
	.empty-state p {
		max-width: 28rem;
		line-height: 1.6;
	}

	.empty-illustration {
		display: grid;
		place-items: center;
		padding: 0.45rem 0.8rem;
		border-radius: var(--radius-pill);
		background: var(--surface-strong);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	@media (max-width: 640px) {
		.hero-stats {
			grid-template-columns: 1fr;
		}

		.controls {
			grid-template-columns: 1fr;
		}

		.export-inline {
			display: none;
		}

		.collection-header {
			align-items: start;
			flex-direction: column;
		}

		.library-error {
			flex-direction: column;
			align-items: start;
		}
	}
</style>
