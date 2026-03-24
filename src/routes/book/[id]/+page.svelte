<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getBook, updateBook, deleteBook } from '$lib/db';
	import type { Book } from '$lib/db';
	import DeleteDialog from '$lib/components/DeleteDialog.svelte';

	let book = $state<Book | null>(null);
	let loading = $state(true);
	let editing = $state(false);
	let saving = $state(false);
	
	// Edit form state
	let title = $state('');
	let author = $state('');
	let isbn = $state('');

	// Delete dialog state
	let showDeleteDialog = $state(false);

	const bookId = parseInt(page.params.id);

	onMount(async () => {
		const loadedBook = await getBook(bookId);
		if (loadedBook) {
			book = loadedBook;
			title = loadedBook.title;
			author = loadedBook.author;
			isbn = loadedBook.isbn;
		} else {
			goto('/');
		}
		loading = false;
	});

	function startEdit() {
		editing = true;
	}

	function cancelEdit() {
		if (book) {
			title = book.title;
			author = book.author;
			isbn = book.isbn;
		}
		editing = false;
	}

	async function handleSave() {
		if (!book) return;
		
		saving = true;
		await updateBook(book.id!, { title, author, isbn });
		book = { ...book, title, author, isbn };
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

<div class="book-detail">
	{#if loading}
		<p class="loading">Loading...</p>
	{:else if book}
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
					<p class="ar-info">AR Level: {book.arLevel}{book.arPoints ? ` • ${book.arPoints} points` : ''}</p>
				{/if}
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
		color: #4A90D9;
		font-weight: 500;
		margin: 0;
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
		border-color: #4A90D9;
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
		background: #4A90D9;
		color: white;
	}

	.btn-cancel:disabled,
	.btn-save:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
