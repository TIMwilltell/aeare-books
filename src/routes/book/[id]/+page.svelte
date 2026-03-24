<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getBook, updateBook, deleteBook, addProgressEvent, getProgressEventsByBook, deleteProgressEventsByBook, type ProgressEvent } from '$lib/db';
	import type { Book } from '$lib/db';
	import DeleteDialog from '$lib/components/DeleteDialog.svelte';
	import ProgressTimeline from '$lib/components/ProgressTimeline.svelte';

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

	const bookId = parseInt(page.params.id);

	onMount(async () => {
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
			readDate: eventDate ? new Date(eventDate) : null
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
			quizDate: new Date(qDate)
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
	{#if loading}
		<p class="loading">Loading...</p>
	{:else if book}
		{#if book.coverUrl}
			<div class="cover-image">
				<img src={book.coverUrl} alt="{book.title} cover" />
			</div>
		{/if}

		<h1>{book.title}</h1>

		{#if editing}
			<form onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
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
					<button type="button" class="btn-cancel" onclick={cancelEdit} disabled={saving}>
						Cancel
					</button>
					<button type="submit" class="btn-save" disabled={saving}>
						{saving ? 'Saving...' : 'Save'}
					</button>
				</div>
			</form>
		{:else}
			<div class="book-info">
				<p class="author">by {book.author}</p>
				<p class="isbn">ISBN: {book.isbn || 'N/A'}</p>
				{#if book.arLevel}
					<div class="ar-info">
						<span>AR Level: {book.arLevel}</span>
						{#if book.arPoints}
							<span>• {book.arPoints} points</span>
						{/if}
						{#if book.arDataSource === 'fetched'}
							<span class="ar-badge fetched">Auto</span>
						{:else if book.arDataSource === 'manual'}
							<span class="ar-badge manual">Manual</span>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Progress Tracking Section -->
			<div class="progress-section">
				<div class="read-status">
					{#if isRead}
						<span class="read-badge">✓ Read</span>
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
					<label for="quiz-score">AR Quiz Score</label>
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
					<label for="notes">Notes</label>
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

			<div class="book-actions">
				<button class="btn-edit" onclick={startEdit}>Edit</button>
				<button class="btn-delete" onclick={confirmDelete}>Delete</button>
			</div>
		{/if}

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
		padding: 20px;
		max-width: 500px;
		margin: 0 auto;
	}

	.cover-image {
		margin-bottom: 20px;
		text-align: center;
	}

	.cover-image img {
		max-width: 150px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	h1 {
		margin: 0 0 16px;
		font-size: 24px;
	}

	.loading {
		text-align: center;
		color: #666;
	}

	.book-info {
		margin-bottom: 24px;
	}

	.author {
		font-size: 18px;
		color: #555;
		margin: 0 0 8px;
	}

	.isbn {
		color: #888;
		margin: 0 0 8px;
	}

	.ar-info {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 4px;
		color: #4a90d9;
		font-weight: 500;
		margin: 0;
	}

	.ar-badge {
		display: inline-block;
		font-size: 11px;
		padding: 2px 6px;
		border-radius: 4px;
		margin-left: 8px;
	}

	.ar-badge.fetched {
		background: #dbeafe;
		color: #1d4ed8;
	}

	.ar-badge.manual {
		background: #fef3c7;
		color: #92400e;
	}

	.book-actions {
		display: flex;
		gap: 12px;
	}

	.btn-edit,
	.btn-delete {
		flex: 1;
		padding: 14px;
		font-size: 16px;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}

	.btn-edit {
		background: #e5e5e5;
		color: #333;
	}

	.btn-delete {
		background: #fee2e2;
		color: #dc2626;
	}

	.form-group {
		margin-bottom: 16px;
	}

	label {
		display: block;
		margin-bottom: 6px;
		font-weight: 500;
		color: #333;
	}

	input {
		width: 100%;
		padding: 12px;
		font-size: 16px;
		border: 1px solid #ddd;
		border-radius: 8px;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: #4a90d9;
	}

	.form-actions {
		display: flex;
		gap: 12px;
		margin-top: 24px;
	}

	.btn-cancel,
	.btn-save {
		flex: 1;
		padding: 14px;
		font-size: 16px;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}

	.btn-cancel {
		background: #e5e5e5;
		color: #333;
	}

	.btn-save {
		background: #4a90d9;
		color: white;
	}

	.btn-cancel:disabled,
	.btn-save:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Progress Tracking Styles */
	.progress-section {
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid #eee;
	}

	.read-status {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
	}

	.read-badge {
		background: #d1fae5;
		color: #065f46;
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 14px;
		font-weight: 500;
	}

	.read-date {
		color: #888;
		font-size: 14px;
	}

	.btn-read-toggle {
		width: 100%;
		padding: 14px;
		font-size: 16px;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		background: #e5e5e5;
		color: #333;
		margin-bottom: 20px;
	}

	.btn-read-toggle.read {
		background: #fef3c7;
		color: #92400e;
	}

	.quiz-section,
	.notes-section {
		margin-bottom: 20px;
	}

	.quiz-section label,
	.notes-section label {
		display: block;
		font-weight: 500;
		margin-bottom: 8px;
		color: #333;
	}

	.quiz-inputs {
		display: flex;
		gap: 8px;
	}

	.quiz-inputs input[type="number"] {
		width: 80px;
	}

	.quiz-inputs input[type="date"] {
		flex: 1;
	}

	.btn-save-quiz,
	.btn-save-notes {
		padding: 10px 16px;
		font-size: 14px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		background: #4a90d9;
		color: white;
	}

	.btn-save-quiz:disabled,
	.btn-save-notes:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	textarea {
		width: 100%;
		padding: 12px;
		font-size: 16px;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-family: inherit;
		resize: vertical;
		box-sizing: border-box;
	}

	textarea:focus {
		outline: none;
		border-color: #4a90d9;
	}

	.btn-save-notes {
		margin-top: 8px;
	}
</style>
