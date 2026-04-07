<script lang="ts">
	import { goto } from '$app/navigation';
	import { authState, signIn } from '$lib/auth/auth0';
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
	let canSyncLibrary = $derived($authState.status === 'signed-in');
	let showLibraryShelf = $derived(canSyncLibrary || books.length > 0);

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
			libraryError = error instanceof Error ? error.message : 'Could not load your library.';
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
			return;
		}

		if (authStatus !== 'signed-in') {
			return;
		}

		void loadBooks();
	}

	async function handleSearch() {
		if (!canSyncLibrary || loading) {
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
			libraryError = error instanceof Error ? error.message : 'Search is unavailable right now.';
			console.error('Failed to search books:', error);
		}
	}

	async function handleRetryLibrary() {
		if (!canSyncLibrary) {
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
		if (!canSyncLibrary) {
			await signIn();
			return;
		}

		goto('/scan');
	}

	async function handleExport() {
		if (!canSyncLibrary || loading) {
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
			<p class="eyebrow">{showLibraryShelf ? 'Library' : 'Welcome'}</p>
			<h1 class="page-title">
				{showLibraryShelf ? 'Your books, in one place.' : 'Keep your library in one place.'}
			</h1>
			<p class="hero-text">
				{#if showLibraryShelf}
					Search, scan, and edit your books.
				{:else}
					Sign in to scan, save, and edit your books.
				{/if}
			</p>
		</div>

		{#if showLibraryShelf}
			<div class="hero-stats" aria-label="Library summary">
				<div class="stat surface-muted">
					<span class="stat-value">{totalBooks}</span>
					<span class="stat-label">Books</span>
				</div>
				<div class="stat surface-muted">
					<span class="stat-value">{arPointsTotal.toFixed(1)}</span>
					<span class="stat-label">AR points</span>
				</div>
			</div>
		{/if}

		<div class="hero-actions">
			<button class="primary-button action-scan" onclick={handleScan}>
				{canSyncLibrary ? 'Scan' : 'Sign in'}
			</button>
			{#if canSyncLibrary}
				<button class="ghost-button" onclick={handleExport}>Export</button>
			{/if}
		</div>
	</section>

	{#if canSyncLibrary}
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
					<p class="eyebrow">Library</p>
					<h2>{searchQuery.trim() ? 'Search is unavailable right now.' : 'Could not load your library.'}</h2>
					<p>{libraryError}</p>
				</div>
				<button class="ghost-button" type="button" onclick={handleRetryLibrary}>Retry</button>
			</section>
		{/if}
	{/if}

	{#if loading && books.length === 0}
		<section class="loading-state section-card" aria-live="polite">
			<LoadingSpinner size="large" color="var(--color-coral-1)" />
			<div>
				<h2>{$authState.status === 'loading' ? 'Checking your session...' : 'Loading your library...'}</h2>
				<p>
					{$authState.status === 'loading'
						? 'Confirming access before we load your books.'
						: 'Pulling in your latest books.'}
				</p>
			</div>
		</section>
	{:else if !showLibraryShelf}
		<section class="empty-state section-card">
			<div class="empty-illustration" aria-hidden="true">Library</div>
			<h2>Start your library.</h2>
			<p>Sign in to scan, add, and edit books.</p>
			<button class="secondary-button" onclick={handleScan}>Sign in</button>
		</section>
	{:else if canSyncLibrary && books.length === 0}
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

	{#if canSyncLibrary}
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
