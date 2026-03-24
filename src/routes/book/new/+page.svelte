<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { addBook } from '$lib/db';

	let isbn = $state('');
	let title = $state('');
	let author = $state('');
	let saving = $state(false);
	let error = $state('');

	// Pre-fill ISBN from URL param
	isbn = page.url.searchParams.get('isbn') || '';

	async function handleSave() {
		if (!title.trim() || !author.trim()) {
			error = 'Title and Author are required';
			return;
		}

		saving = true;
		error = '';

		try {
			await addBook(title.trim(), author.trim(), isbn.trim());
			goto('/');
		} catch (e) {
			error = 'Failed to save book';
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

<div class="book-form">
	<h1>Add Book</h1>

	<form onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
		<div class="form-group">
			<label for="isbn">ISBN</label>
			<input
				type="text"
				id="isbn"
				bind:value={isbn}
				placeholder="Enter ISBN (optional)"
			/>
		</div>

		<div class="form-group">
			<label for="title">Title *</label>
			<input
				type="text"
				id="title"
				bind:value={title}
				placeholder="Enter book title"
				required
			/>
		</div>

		<div class="form-group">
			<label for="author">Author *</label>
			<input
				type="text"
				id="author"
				bind:value={author}
				placeholder="Enter author name"
				required
			/>
		</div>

		{#if error}
			<p class="error">{error}</p>
		{/if}

		<div class="form-actions">
			<button type="button" class="btn-cancel" onclick={handleCancel} disabled={saving}>
				Cancel
			</button>
			<button type="submit" class="btn-save" disabled={saving}>
				{saving ? 'Saving...' : 'Save'}
			</button>
		</div>
	</form>
</div>

<style>
	.book-form {
		padding: 20px;
		max-width: 500px;
		margin: 0 auto;
	}

	h1 {
		margin: 0 0 24px;
		font-size: 24px;
		text-align: center;
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

	.error {
		color: #dc2626;
		font-size: 14px;
		margin: 0;
	}
</style>
