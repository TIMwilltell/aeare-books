<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { addBook } from '$lib/db';
	import { lookupBook } from '$lib/api/books';
	import { lookupAr } from '$lib/api/ar';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let isbn = $state('');
	let title = $state('');
	let author = $state('');
	let coverUrl = $state('');
	let arLevel = $state<number | undefined>(undefined);
	let arPoints = $state<number | undefined>(undefined);
	let arDataSource = $state<'fetched' | 'manual'>('manual');
	let saving = $state(false);
	let lookupLoading = $state(false);
	let lookupError = $state('');

	isbn = page.url.searchParams.get('isbn') || '';

	async function handleLookup() {
		if (!isbn.trim()) return;

		lookupLoading = true;
		lookupError = '';

		try {
			const bookResult = await lookupBook(isbn.trim());
			if (bookResult.success && bookResult.data) {
				title = bookResult.data.title;
				author = bookResult.data.author;
				coverUrl = bookResult.data.coverUrl || '';
			} else {
				lookupError = bookResult.error || 'Book not found';
			}

			const arResult = await lookupAr(isbn.trim());
			if (arResult.success && arResult.data) {
				arLevel = arResult.data.arLevel;
				arPoints = arResult.data.arPoints;
				arDataSource = 'fetched';
			}
		} catch (e) {
			lookupError = 'Lookup failed. Please enter details manually.';
			console.error(e);
		} finally {
			lookupLoading = false;
		}
	}

	async function handleSave() {
		if (!title.trim() || !author.trim()) {
			return;
		}

		saving = true;

		try {
			await addBook(title.trim(), author.trim(), isbn.trim(), coverUrl || undefined, arLevel, arPoints, arDataSource);
			goto('/');
		} catch (e) {
			console.error(e);
		} finally {
			saving = false;
		}
	}

	function handleCancel() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Add Book - AeAre Books</title>
</svelte:head>

<div class="book-form-page">
	<section class="intro">
		<p class="eyebrow">New entry</p>
		<h1 class="page-title">Add a book to the shelf.</h1>
		<p>Look up details from the ISBN, then refine the record before saving it into your library.</p>
	</section>

	<form class="book-form" onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
		<section class="hero-card section-card">
			<div class:has-cover={!!coverUrl} class="cover-preview">
				{#if coverUrl}
					<img src={coverUrl} alt="Book cover" />
				{:else}
					<div class="cover-placeholder" aria-hidden="true">
						<span>Book</span>
						<small>Cover</small>
					</div>
				{/if}
			</div>

			<div class="lookup-panel">
				<div>
					<p class="eyebrow">Quick lookup</p>
					<h2>Start with an ISBN</h2>
					<p>Scan or type a code to prefill title, author, cover, and AR details.</p>
				</div>

				<label class="field" for="isbn">
					<span>ISBN</span>
					<div class="isbn-row">
						<input type="text" id="isbn" bind:value={isbn} placeholder="Enter ISBN (optional)" />
						<button type="button" class="secondary-button lookup-button" onclick={handleLookup} disabled={!isbn.trim() || lookupLoading}>
							{#if lookupLoading}
								<LoadingSpinner size="small" color="var(--color-cream-0)" />
							{:else}
								Lookup
							{/if}
						</button>
					</div>
				</label>

				{#if lookupError}
					<p class="lookup-error" aria-live="polite">{lookupError}</p>
				{/if}
			</div>
		</section>

		<section class="details-grid">
			<div class="section-card form-section">
				<div class="section-header">
					<p class="eyebrow">Book details</p>
					<h2>Core metadata</h2>
				</div>

				<label class="field" for="title">
					<span>Title *</span>
					<input type="text" id="title" bind:value={title} placeholder="Enter book title" required />
				</label>

				<label class="field" for="author">
					<span>Author *</span>
					<input type="text" id="author" bind:value={author} placeholder="Enter author name" required />
				</label>
			</div>

			<div class="section-card form-section">
				<div class="section-header">
					<p class="eyebrow">AR metrics</p>
					<h2>AR tracking</h2>
				</div>

				<label class="field" for="ar-level">
					<span>AR Level</span>
					<input type="number" id="ar-level" bind:value={arLevel} step="0.1" min="0" max="20" placeholder="e.g. 4.5" />
				</label>

				<label class="field" for="ar-points">
					<span>AR Points</span>
					<input type="number" id="ar-points" bind:value={arPoints} step="0.1" min="0" placeholder="e.g. 5" />
				</label>

				{#if arLevel}
					<span class="pill source-pill {arDataSource}">
						{arDataSource === 'fetched' ? 'Auto-fetched data' : 'Manual data'}
					</span>
				{/if}
			</div>
		</section>

		<div class="form-actions">
			<button type="button" class="ghost-button" onclick={handleCancel} disabled={saving}>Cancel</button>
			<button type="submit" class="primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save book'}</button>
		</div>
	</form>
</div>

<style>
	.book-form-page {
		display: grid;
		gap: 1rem;
	}

	.intro {
		display: grid;
		gap: 0.7rem;
		padding: 0.4rem 0.1rem 0;
	}

	.intro p:last-child,
	.lookup-panel p,
	.section-header h2 {
		margin: 0;
	}

	.intro p:last-child,
	.lookup-panel p,
	.form-section {
		line-height: 1.6;
	}

	.book-form {
		display: grid;
		gap: 1rem;
	}

	.hero-card {
		display: grid;
		grid-template-columns: 8rem 1fr;
		gap: 1rem;
		padding: 1rem;
	}

	.cover-preview {
		border-radius: 1.3rem;
		background: var(--surface-strong);
		min-height: 12rem;
		overflow: hidden;
		border: 1px solid var(--border-subtle);
	}

	.cover-preview img,
	.cover-placeholder {
		width: 100%;
		height: 100%;
	}

	.cover-preview img {
		object-fit: cover;
	}

	.cover-placeholder {
		display: grid;
		place-items: center;
		align-content: center;
		gap: 0.15rem;
		font-family: var(--font-serif);
		color: var(--text-default);
	}

	.cover-placeholder span {
		font-size: 1.1rem;
	}

	.cover-placeholder small {
		font-size: 0.82rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.lookup-panel,
	.form-section {
		display: grid;
		gap: 1rem;
	}

	.lookup-panel h2,
	.section-header h2 {
		font-family: var(--font-serif);
		font-size: 1.45rem;
		color: var(--text-strong);
	}

	.details-grid {
		display: grid;
		gap: 1rem;
	}

	.form-section {
		padding: 1rem;
	}

	.field {
		display: grid;
		gap: 0.45rem;
	}

	.field > span {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--text-strong);
	}

	.isbn-row {
		display: flex;
		gap: 0.75rem;
	}

	.lookup-button {
		min-width: 7rem;
	}

	.lookup-error {
		margin: 0;
		padding: 0.85rem 1rem;
		border-radius: var(--radius-sm);
		background: rgba(185, 85, 71, 0.1);
		color: var(--color-danger);
	}

	.source-pill.fetched {
		background: rgba(70, 97, 79, 0.12);
		color: var(--color-moss-1);
	}

	.source-pill.manual {
		background: rgba(240, 201, 119, 0.22);
		color: #8b6321;
	}

	.form-actions {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	@media (max-width: 640px) {
		.hero-card {
			grid-template-columns: 1fr;
		}

		.cover-preview {
			max-width: 9rem;
			min-height: 12rem;
		}

		.isbn-row,
		.form-actions {
			grid-template-columns: 1fr;
			display: grid;
		}
	}
</style>
