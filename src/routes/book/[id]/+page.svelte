<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getBook, updateBook, deleteBook, addProgressEvent, getProgressEventsByBook, type ProgressEvent } from '$lib/db';
	import type { Book } from '$lib/db';
	import DeleteDialog from '$lib/components/DeleteDialog.svelte';
	import ProgressTimeline from '$lib/components/ProgressTimeline.svelte';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';
	import SecondaryButton from '$lib/components/SecondaryButton.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Skeleton from '$lib/components/Skeleton.svelte';

	let book = $state<Book | null>(null);
	let loading = $state(true);
	let editing = $state(false);
	let saving = $state(false);

	// Edit form state
	let title = $state('');
	let author = $state('');
	let isbn = $state('');
	let arLevel = $state(0);
	let arPoints = $state(0);

	// Delete dialog state
	let showDeleteDialog = $state(false);

	// Progress tracking state
	let isRead = $state(false);
	let readDate = $state<string>('');
	let quizScore = $state<number | undefined>(undefined);
	let quizDate = $state<string>('');
	let notes = $state('');
	let progressEvents = $state<ProgressEvent[]>([]);
	let savingProgress = $state(false);

	const bookId = page.params.id;

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
			isRead = loadedBook.isRead || false;
			readDate = loadedBook.readDate ? new Date(loadedBook.readDate).toISOString().split('T')[0] : '';
			quizScore = loadedBook.quizScore;
			quizDate = loadedBook.quizDate ? new Date(loadedBook.quizDate).toISOString().split('T')[0] : '';
			notes = loadedBook.notes || '';
			progressEvents = await getProgressEventsByBook(bookId);
		} else {
			goto('/');
		}
		loading = false;
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

	// Progress tracking functions
	async function toggleReadStatus() {
		if (!book?.id) return;
		savingProgress = true;
		const newIsRead = !isRead;
		const eventDate = newIsRead ? (readDate || new Date().toISOString().split('T')[0]) : undefined;
		
		await updateBook(book.id, { 
			isRead: newIsRead,
			readDate: eventDate ? new Date(eventDate).getTime() : null
		});
		
		if (newIsRead) {
			await addProgressEvent(book.id, 'marked_read', undefined, eventDate ? new Date(eventDate) : undefined);
		}
		
		isRead = newIsRead;
		readDate = eventDate || '';
		progressEvents = await getProgressEventsByBook(book.id);
		savingProgress = false;
	}

	async function saveQuizScore() {
		if (!book?.id || quizScore === undefined) return;
		savingProgress = true;
		const qDate = quizDate || new Date().toISOString().split('T')[0];
		
		await updateBook(book.id, { 
			quizScore: quizScore,
			quizDate: new Date(qDate).getTime()
		});
		
		await addProgressEvent(book.id, 'quiz_completed', `${quizScore}%`, new Date(qDate));
		
		quizDate = qDate;
		progressEvents = await getProgressEventsByBook(book.id);
		savingProgress = false;
	}

	async function saveNotes() {
		if (!book?.id) return;
		savingProgress = true;
		
		await updateBook(book.id, { notes });
		
		await addProgressEvent(book.id, 'notes_added', notes);
		
		progressEvents = await getProgressEventsByBook(book.id);
		savingProgress = false;
	}
</script>

<svelte:head>
	<title>{book?.title || 'Book'} - AeAre Books</title>
</svelte:head>

<div class="book-detail">
	<!-- Header with glassmorphism -->
	<header class="page-header">
		<div class="header-content">
			<SecondaryButton label="← Back" onclick={() => goto('/')} />
			<h1 class="header-title">Book Details</h1>
			<div class="header-spacer"></div>
		</div>
	</header>

	{#if loading}
		<div class="loading-container">
			<Skeleton variant="thumbnail" />
			<Skeleton variant="title" />
			<Skeleton variant="text" />
			<Skeleton variant="text" />
		</div>
	{:else if book}
		<main class="book-content">
			<!-- Cover Image -->
			{#if book.coverUrl}
				<div class="cover-container">
					<img src={book.coverUrl} alt="{book.title} cover" class="cover-image" />
				</div>
			{:else}
				<div class="cover-container cover-fallback">
					<span class="cover-icon">📚</span>
				</div>
			{/if}

			<!-- Book Metadata -->
			<div class="book-metadata">
				<h2 class="book-title">{book.title}</h2>
				<p class="book-author">by {book.author}</p>
				{#if book.isbn}
					<p class="book-isbn">ISBN: {book.isbn}</p>
				{/if}
			</div>

			{#if editing}
				<!-- Edit Form -->
				<form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="edit-form">
					<div class="form-group">
						<label for="title">Title</label>
						<input type="text" id="title" bind:value={title} required />
					</div>
					<div class="form-group">
						<label for="author">Author</label>
						<input type="text" id="author" bind:value={author} required />
					</div>
					<div class="form-group">
						<label for="isbn">ISBN</label>
						<input type="text" id="isbn" bind:value={isbn} />
					</div>
					<div class="form-group">
						<label for="ar-level">AR Level</label>
						<input
							type="number"
							id="ar-level"
							bind:value={arLevel}
							step="0.1"
							min="0"
							max="20"
						/>
					</div>
					<div class="form-group">
						<label for="ar-points">AR Points</label>
						<input type="number" id="ar-points" bind:value={arPoints} step="0.1" min="0" />
					</div>
					<div class="form-actions">
						<SecondaryButton label="Cancel" onclick={cancelEdit} disabled={saving} fullWidth={true} />
						<PrimaryButton label={saving ? 'Saving...' : 'Save'} onclick={handleSave} disabled={saving} fullWidth={true} />
					</div>
				</form>
			{:else}
				<!-- AR Section -->
				{#if book.arLevel}
					<div class="ar-section">
						<div class="ar-level-display">
							<span class="ar-level-label">AR Level</span>
							<span class="ar-level-value">{book.arLevel}</span>
						</div>
						{#if book.arPoints}
							<span class="ar-points">{book.arPoints} pts</span>
						{/if}
						{#if book.arDataSource === 'fetched'}
							<Badge label="Auto" variant="ar-fetched" size="sm" />
						{:else if book.arDataSource === 'manual'}
							<Badge label="Manual" variant="ar-manual" size="sm" />
						{/if}
					</div>
				{/if}

				<!-- Progress Tracking Section -->
				<div class="progress-section">
					<div class="read-status">
						{#if isRead}
							<Badge label="✓ Read" variant="ar-fetched" size="sm" />
							{#if readDate}
								<span class="read-date">on {new Date(readDate).toLocaleDateString()}</span>
							{/if}
						{/if}
					</div>
					
					<button 
						class="btn-read-toggle" 
						class:read={isRead}
						onclick={toggleReadStatus}
						disabled={savingProgress}
					>
						{isRead ? 'Mark as Unread' : 'Mark as Read'}
					</button>
					
					<div class="quiz-section">
						<label for="quiz-score" class="input-label">AR Quiz Score</label>
						<div class="quiz-inputs">
							<input 
								type="number" 
								id="quiz-score" 
								bind:value={quizScore}
								min="0"
								max="100"
								placeholder="0-100"
							/>
							<input 
								type="date" 
								bind:value={quizDate}
							/>
							<button class="btn-save-quiz" onclick={saveQuizScore} disabled={savingProgress || quizScore === undefined}>
								Save
							</button>
						</div>
					</div>
					
					<div class="notes-section">
						<label for="notes" class="input-label">Notes</label>
						<textarea 
							id="notes" 
							bind:value={notes}
							placeholder="Add reading notes..."
							rows="4"
						></textarea>
						<button class="btn-save-notes" onclick={saveNotes} disabled={savingProgress}>
							Save Notes
						</button>
					</div>
					
					<ProgressTimeline events={progressEvents} />
				</div>

				<!-- Action Buttons -->
				<div class="book-actions">
					<PrimaryButton label="Edit" onclick={startEdit} fullWidth={true} />
					<SecondaryButton label="Delete" onclick={confirmDelete} fullWidth={true} />
				</div>
			{/if}
		</main>

		<DeleteDialog
			open={showDeleteDialog}
			bookTitle={book.title}
			onClose={closeDeleteDialog}
			onConfirm={handleDelete}
		/>
	{/if}
</div>

<style>
	.book-detail {
		min-height: 100vh;
		background: var(--surface);
	}

	/* Header with glassmorphism */
	.page-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(247, 245, 255, 0.8);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--outline-variant);
		padding: var(--space-3) var(--space-4);
	}

	.header-content {
		max-width: 500px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.header-title {
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--on-surface);
		margin: 0;
		white-space: nowrap;
	}

	.header-spacer {
		width: 80px;
	}

	.loading-container {
		max-width: 500px;
		margin: 0 auto;
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.book-content {
		max-width: 500px;
		margin: 0 auto;
		padding: var(--space-4);
	}

	/* Cover Image */
	.cover-container {
		margin-bottom: var(--space-4);
		text-align: center;
	}

	.cover-image {
		max-width: 240px;
		width: 100%;
		aspect-ratio: 2/3;
		object-fit: cover;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-elevated);
	}

	.cover-fallback {
		max-width: 240px;
		margin: 0 auto var(--space-4);
		aspect-ratio: 2/3;
		background: var(--surface-container-low);
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cover-icon {
		font-size: 4rem;
		opacity: 0.5;
	}

	/* Book Metadata */
	.book-metadata {
		text-align: center;
		margin-bottom: var(--space-6);
	}

	.book-title {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		color: var(--on-surface);
		margin: 0 0 var(--space-2);
		line-height: var(--leading-tight);
	}

	.book-author {
		font-family: var(--font-body);
		font-size: var(--text-lg);
		color: var(--on-surface-variant);
		margin: 0 0 var(--space-2);
	}

	.book-isbn {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--on-surface-variant);
		margin: 0;
	}

	/* AR Section */
	.ar-section {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--surface-container-low);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-6);
	}

	.ar-level-display {
		display: flex;
		flex-direction: column;
	}

	.ar-level-label {
		font-family: var(--font-body);
		font-size: var(--text-xs);
		color: var(--on-surface-variant);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.ar-level-value {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		font-weight: var(--font-bold);
		color: var(--on-surface);
		line-height: 1;
	}

	.ar-points {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--primary);
	}

	/* Progress Section */
	.progress-section {
		margin-bottom: var(--space-6);
	}

	.read-status {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.read-date {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--on-surface-variant);
	}

	.btn-read-toggle {
		width: 100%;
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		background: var(--surface-container-high);
		color: var(--on-surface);
		transition: background var(--transition-fast), transform var(--transition-fast);
		margin-bottom: var(--space-4);
	}

	.btn-read-toggle:hover:not(:disabled) {
		transform: scale(1.01);
	}

	.btn-read-toggle.read {
		background: var(--secondary-fixed);
		color: var(--on-secondary-container);
	}

	.btn-read-toggle:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.quiz-section,
	.notes-section {
		margin-bottom: var(--space-4);
	}

	.input-label {
		display: block;
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--on-surface-variant);
		margin-bottom: var(--space-2);
	}

	.quiz-inputs {
		display: flex;
		gap: var(--space-2);
	}

	.quiz-inputs input[type="number"] {
		width: 80px;
		padding: var(--space-2) var(--space-3);
		font-family: var(--font-body);
		font-size: var(--text-base);
		border: 2px solid transparent;
		border-radius: var(--radius-DEFAULT);
		background: var(--surface-container-highest);
		color: var(--on-surface);
	}

	.quiz-inputs input[type="number"]:focus {
		outline: none;
		border-color: var(--primary);
	}

	.quiz-inputs input[type="date"] {
		flex: 1;
		padding: var(--space-2) var(--space-3);
		font-family: var(--font-body);
		font-size: var(--text-base);
		border: 2px solid transparent;
		border-radius: var(--radius-DEFAULT);
		background: var(--surface-container-highest);
		color: var(--on-surface);
	}

	.quiz-inputs input[type="date"]:focus {
		outline: none;
		border-color: var(--primary);
	}

	.btn-save-quiz,
	.btn-save-notes {
		padding: var(--space-2) var(--space-4);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		background: var(--primary);
		color: var(--on-primary);
		transition: transform var(--transition-fast);
	}

	.btn-save-quiz:hover:not(:disabled),
	.btn-save-notes:hover:not(:disabled) {
		transform: scale(1.02);
	}

	.btn-save-quiz:disabled,
	.btn-save-notes:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	textarea {
		width: 100%;
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-body);
		font-size: var(--text-base);
		border: 2px solid transparent;
		border-radius: var(--radius-DEFAULT);
		background: var(--surface-container-highest);
		color: var(--on-surface);
		resize: vertical;
		box-sizing: border-box;
	}

	textarea:focus {
		outline: none;
		border-color: var(--primary);
	}

	textarea::placeholder {
		color: var(--on-surface-variant);
		opacity: 0.6;
	}

	.btn-save-notes {
		margin-top: var(--space-2);
	}

	/* Action Buttons */
	.book-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	/* Edit Form */
	.edit-form {
		background: var(--surface-container-low);
		border-radius: var(--radius-md);
		padding: var(--space-4);
	}

	.form-group {
		margin-bottom: var(--space-4);
	}

	.form-group label {
		display: block;
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		color: var(--on-surface-variant);
		margin-bottom: var(--space-2);
	}

	.form-group input {
		width: 100%;
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-body);
		font-size: var(--text-base);
		border: 2px solid transparent;
		border-radius: var(--radius-DEFAULT);
		background: var(--surface-container-highest);
		color: var(--on-surface);
		box-sizing: border-box;
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--primary);
	}

	.form-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}
</style>
