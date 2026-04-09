<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { deleteBook, getBook, getProgressEventsByBook, updateBook } from '$lib/db';
	import type { Book, ProgressEvent } from '$lib/db';
	import DeleteDialog from '$lib/components/DeleteDialog.svelte';
	import ProgressTimeline from '$lib/components/ProgressTimeline.svelte';

	let book = $state<Book | null>(null);
	let loading = $state(true);
	let editing = $state(false);
	let saving = $state(false);
	let progressEvents = $state<ProgressEvent[]>([]);
	let progressLoading = $state(false);
	let progressError = $state<string | null>(null);

	let title = $state('');
	let author = $state('');
	let isbn = $state('');
	let arLevel = $state(0);
	let arPoints = $state(0);

	let showDeleteDialog = $state(false);

	const bookId = page.params.id;

	async function loadProgress(bookProgressId: string) {
		progressLoading = true;
		progressError = null;

		try {
			progressEvents = await getProgressEventsByBook(bookProgressId);
		} catch (error) {
			progressEvents = [];
			progressError = error instanceof Error ? error.message : 'Could not load reading activity.';
		} finally {
			progressLoading = false;
		}
	}

	onMount(async () => {
		if (!bookId) {
			goto('/');
			return;
		}
		const loadedBook = await getBook(bookId);
		if (loadedBook) {
			book = loadedBook;
			title = loadedBook.title;
			author = loadedBook.author;
			isbn = loadedBook.isbn;
			arLevel = loadedBook.arLevel || 0;
			arPoints = loadedBook.arPoints || 0;
			loading = false;
			void loadProgress(loadedBook.id);
		} else {
			goto('/');
			return;
		}
	});

	function startEdit() {
		if (book) {
			arLevel = book.arLevel || 0;
			arPoints = book.arPoints || 0;
		}
		editing = true;
	}

	function cancelEdit() {
		if (book) {
			title = book.title;
			author = book.author;
			isbn = book.isbn;
			arLevel = book.arLevel || 0;
			arPoints = book.arPoints || 0;
		}
		editing = false;
	}

	async function handleSave() {
		if (!book) return;

		saving = true;
		const arDataSource = arLevel || arPoints ? 'manual' : undefined;
		await updateBook(book.id!, {
			title,
			author,
			isbn,
			arLevel: arLevel || undefined,
			arPoints: arPoints || undefined,
			arDataSource
		});
		book = {
			...book,
			title,
			author,
			isbn,
			arLevel: arLevel || undefined,
			arPoints: arPoints || undefined,
			arDataSource
		};
		editing = false;
		saving = false;
	}

	function confirmDelete() {
		showDeleteDialog = true;
	}

	async function handleDelete() {
		if (!book?.id) return;
		await deleteBook(book.id);
		showDeleteDialog = false;
		goto('/');
	}

	function closeDeleteDialog() {
		showDeleteDialog = false;
	}
</script>

<svelte:head>
	<title>{book?.title || 'Book'} - AeAre Books</title>
</svelte:head>

<div class="book-detail-page">
	{#if loading}
		<section class="section-card loading-card">
			<p>Loading book...</p>
		</section>
	{:else if book}
		<section class="hero-card section-card">
			<div class="cover-wrap">
				{#if book.coverUrl}
					<img class="cover-image" src={book.coverUrl} alt="{book.title} cover" />
				{:else}
					<div class="cover-fallback" aria-hidden="true">
						<span>{book.title.slice(0, 2).toUpperCase()}</span>
					</div>
				{/if}
			</div>

			<div class="hero-copy">
				<p class="eyebrow">Book</p>
				<h1 class="page-title">{book.title}</h1>
				<p class="author-line">by {book.author}</p>

				<div class="meta-row">
					<span class="pill neutral">{book.isbn ? `ISBN ${book.isbn}` : 'ISBN unavailable'}</span>
					{#if book.arLevel != null || book.arPoints != null}
						<span class="pill ar">
							{#if book.arLevel != null}
								AR {book.arLevel}{book.arPoints != null ? ` • ${book.arPoints} pts` : ''}
							{:else if book.arPoints != null}
								AR {book.arPoints} pts
							{/if}
						</span>
					{/if}
					{#if book.arDataSource === 'fetched'}
						<span class="pill source fetched">From lookup</span>
					{:else if book.arDataSource === 'manual'}
						<span class="pill source manual">Manual</span>
					{/if}
				</div>

				<div class="action-row">
					<button class="primary-button" onclick={startEdit}>Edit</button>
					<button class="danger-button" onclick={confirmDelete}>Delete</button>
				</div>
			</div>
		</section>

		{#if editing}
			<section class="section-card form-card">
				<div class="section-header">
					<p class="eyebrow">Edit</p>
					<h2>Edit details</h2>
				</div>

				<form class="edit-form" onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
					<label class="field" for="title">
						<span>Title</span>
						<input type="text" id="title" bind:value={title} required />
					</label>

					<label class="field" for="author">
						<span>Author</span>
						<input type="text" id="author" bind:value={author} required />
					</label>

					<label class="field" for="isbn">
						<span>ISBN</span>
						<input type="text" id="isbn" bind:value={isbn} />
					</label>

					<div class="split-fields">
						<label class="field" for="ar-level">
							<span>AR Level</span>
							<input type="number" id="ar-level" bind:value={arLevel} step="0.1" min="0" max="20" />
						</label>

						<label class="field" for="ar-points">
							<span>AR Points</span>
							<input type="number" id="ar-points" bind:value={arPoints} step="0.1" min="0" />
						</label>
					</div>

					<div class="form-actions">
						<button type="button" class="ghost-button" onclick={cancelEdit} disabled={saving}>Cancel</button>
						<button type="submit" class="primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
					</div>
				</form>
			</section>
		{:else}
			<section class="detail-grid">
				<div class="section-card detail-card metadata-card">
					<div class="section-header compact">
						<p class="eyebrow">Details</p>
						<h2>Book info</h2>
					</div>

					<div class="metadata-list surface-muted">
						<div>
							<span>Title</span>
							<strong>{book.title}</strong>
						</div>
						<div>
							<span>Author</span>
							<strong>{book.author}</strong>
						</div>
						<div>
							<span>ISBN</span>
							<strong>{book.isbn || 'Not set'}</strong>
						</div>
						<div>
							<span>AR Level</span>
							<strong>{book.arLevel ?? 'Not set'}</strong>
						</div>
						<div>
							<span>AR Points</span>
							<strong>{book.arPoints ?? 'Not set'}</strong>
						</div>
						<div>
							<span>AR Source</span>
							<strong>{book.arDataSource === 'fetched' ? 'From lookup' : book.arDataSource === 'manual' ? 'Manual' : 'Not set'}</strong>
						</div>
					</div>
				</div>

				<div class="section-card detail-card progress-card">
					{#if progressError}
						<div class="progress-feedback" role="alert">
							<p class="eyebrow">Reading log</p>
							<h2>Timeline unavailable right now.</h2>
							<p>{progressError}</p>
						</div>
					{:else if progressLoading}
						<div class="progress-feedback" aria-live="polite">
							<p class="eyebrow">Reading log</p>
							<h2>Loading timeline…</h2>
							<p>We are gathering the latest activity for this book.</p>
						</div>
					{:else}
						<ProgressTimeline events={progressEvents} />
					{/if}
				</div>
			</section>
		{/if}

		<DeleteDialog open={showDeleteDialog} bookTitle={book.title} onClose={closeDeleteDialog} onConfirm={handleDelete} />
	{/if}
</div>

<style>
	.book-detail-page {
		display: grid;
		gap: 1rem;
	}

	.loading-card {
		padding: 1.4rem;
		text-align: center;
	}

	.loading-card p {
		margin: 0;
	}

	.hero-card {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1rem;
		padding: 1rem;
	}

	.cover-wrap {
		width: 8.7rem;
	}

	.cover-image,
	.cover-fallback {
		width: 100%;
		aspect-ratio: 3 / 4.2;
		border-radius: 1.4rem;
	}

	.cover-image {
		object-fit: cover;
		box-shadow: var(--shadow-card);
	}

	.cover-fallback {
		display: grid;
		place-items: center;
		background: var(--surface-strong);
		font-family: var(--font-serif);
		font-size: 2rem;
		color: var(--text-strong);
	}

	.hero-copy {
		display: grid;
		gap: 0.9rem;
	}

	.author-line,
	.meta-row,
	.section-header h2 {
		margin: 0;
	}

	.author-line {
		font-size: 1.05rem;
		color: var(--text-default);
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.pill.neutral {
		background: rgba(255, 251, 244, 0.92);
		color: var(--text-default);
		border: 1px solid var(--border-subtle);
	}

	.pill.ar {
		background: rgba(240, 201, 119, 0.22);
		color: #8b6321;
	}

	.pill.source.fetched {
		background: rgba(70, 97, 79, 0.12);
		color: var(--color-moss-1);
	}

	.pill.source.manual {
		background: rgba(213, 111, 91, 0.12);
		color: var(--color-coral-1);
	}

	.action-row,
	.form-actions {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.form-card,
	.detail-card {
		padding: 1rem;
	}

	.progress-card,
	.progress-feedback {
		display: grid;
		gap: 0.75rem;
	}

	.progress-feedback h2,
	.progress-feedback p {
		margin: 0;
	}

	.progress-feedback h2 {
		font-family: var(--font-serif);
		font-size: 1.45rem;
		color: var(--text-strong);
	}

	.progress-feedback p:last-child {
		line-height: 1.6;
		color: var(--text-default);
	}

	.section-header {
		display: grid;
		gap: 0.35rem;
		margin-bottom: 1rem;
	}

	.section-header h2 {
		font-family: var(--font-serif);
		font-size: 1.45rem;
		color: var(--text-strong);
	}

	.edit-form,
	.detail-grid {
		display: grid;
		gap: 1rem;
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

	.split-fields {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.metadata-list {
		display: grid;
		gap: 0.75rem;
		padding: 0.95rem;
	}

	.metadata-list > div {
		display: grid;
		gap: 0.2rem;
	}

	.metadata-list span {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.metadata-list strong {
		font-size: 0.98rem;
		color: var(--text-strong);
	}

	@media (max-width: 720px) {
		.hero-card {
			grid-template-columns: 1fr;
		}

		.cover-wrap {
			width: 8rem;
		}

		.action-row,
		.form-actions,
		.split-fields {
			grid-template-columns: 1fr;
		}
	}
</style>
