<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getAllBooks, searchBooks, type Book } from '$lib/db';
	import { exportLibrary } from '$lib/api/export';
	import BookList from '$lib/components/BookList.svelte';
	import FAB from '$lib/components/FAB.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let books = $state<Book[]>([]);
	let searchQuery = $state('');
	let loading = $state(true);
	let requestId = 0;

	let totalBooks = $derived(books.length);
	let arPointsTotal = $derived(
		books.reduce((sum, book) => sum + (typeof book.arPoints === 'number' ? book.arPoints : 0), 0)
	);

	onMount(async () => {
		const currentRequestId = ++requestId;
		const allBooks = await getAllBooks();
		if (currentRequestId !== requestId) {
			return;
		}
		books = allBooks;
		loading = false;
	});

	async function handleSearch() {
		if (loading) {
			return;
		}

		const currentRequestId = ++requestId;
		const results = await searchBooks(searchQuery);
		if (currentRequestId !== requestId) {
			return;
		}
		books = results;
	}

	function handleBookSelect(id: string) {
		goto(`/book/${id}`);
	}

	function handleScan() {
		goto('/scan');
	}

	async function handleExport() {
		try {
			await exportLibrary();
		} catch (error) {
			console.error('Export failed:', error);
			alert('Failed to export library. Please try again.');
		}
	}
</script>

<svelte:head>
	<title>AeAre Books</title>
</svelte:head>

<div class="library-page">
	<section class="hero section-card">
		<div class="hero-copy">
			<p class="eyebrow">Your library</p>
			<h1 class="page-title">A warmer home for every book you track.</h1>
			<p class="hero-text">
				Search your shelf, export your records, and manage your catalog in one calm, mobile-first dashboard.
			</p>
		</div>

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

		<div class="hero-actions">
			<button class="primary-button action-scan" onclick={handleScan}>
				Scan a book
			</button>
			<button class="ghost-button" onclick={handleExport}>
				Export library
			</button>
		</div>
	</section>

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

	{#if loading}
		<section class="loading-state section-card" aria-live="polite">
			<LoadingSpinner size="large" color="var(--color-coral-1)" />
			<div>
				<h2>Settling your shelf…</h2>
				<p>We’re gathering your books and catalog details.</p>
			</div>
		</section>
	{:else if books.length === 0}
		<section class="empty-state section-card">
			<div class="empty-illustration" aria-hidden="true">Library</div>
			<h2>Your shelf is ready for its first story.</h2>
			<p>Scan a barcode or add a book manually to begin building your reading companion.</p>
			<button class="secondary-button" onclick={handleScan}>Scan your first book</button>
		</section>
	{:else}
		<section class="collection-header">
			<div>
				<p class="eyebrow">Collection</p>
				<h2>Browse your current shelf</h2>
			</div>
			<p>{books.length} result{books.length === 1 ? '' : 's'}</p>
		</section>

		<BookList {books} onSelect={handleBookSelect} />
	{/if}

	<FAB onclick={handleScan} />
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
	}
</style>
