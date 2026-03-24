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

	// Pre-fill ISBN from URL param
	isbn = page.url.searchParams.get('isbn') || '';

	async function handleLookup() {
		if (!isbn.trim()) return;

		lookupLoading = true;
		lookupError = '';

		try {
			// Fetch Google Books metadata
			const bookResult = await lookupBook(isbn.trim());
			if (bookResult.success && bookResult.data) {
				title = bookResult.data.title;
				author = bookResult.data.author;
				coverUrl = bookResult.data.coverUrl || '';
			} else {
				lookupError = bookResult.error || 'Book not found';
			}

			// Fetch AR data
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
			await addBook(
				title.trim(),
				author.trim(),
				isbn.trim(),
				coverUrl || undefined,
				arLevel,
				arPoints,
				arDataSource
			);
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

<div class="book-form">
	<h1>Add Book</h1>

	<form onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
		<div class="form-group">
			<label for="isbn">ISBN</label>
			<div class="isbn-row">
				<input
					type="text"
					id="isbn"
					bind:value={isbn}
					placeholder="Enter ISBN (optional)"
				/>
				<button
					type="button"
					class="btn-lookup"
					onclick={handleLookup}
					disabled={!isbn.trim() || lookupLoading}
				>
					{#if lookupLoading}
						<LoadingSpinner size="small" />
					{:else}
						Lookup
					{/if}
				</button>
			</div>
			{#if lookupError}
				<p class="lookup-error">{lookupError}</p>
			{/if}
		</div>

		{#if coverUrl}
			<div class="cover-preview">
				<img src={coverUrl} alt="Book cover" />
			</div>
		{/if}

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

		<div class="form-group">
			<label for="ar-level">AR Level</label>
			<input
				type="number"
				id="ar-level"
				bind:value={arLevel}
				step="0.1"
				min="0"
				max="20"
				placeholder="e.g., 4.5"
			/>
			{#if arDataSource === 'fetched' && arLevel}
				<span class="ar-badge fetched">Auto-fetched</span>
			{:else if arLevel}
				<span class="ar-badge manual">Manual</span>
			{/if}
		</div>

		<div class="form-group">
			<label for="ar-points">AR Points</label>
			<input
				type="number"
				id="ar-points"
				bind:value={arPoints}
				step="0.1"
				min="0"
				placeholder="e.g., 5"
			/>
		</div>

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
		border-color: #4a90d9;
	}

	.isbn-row {
		display: flex;
		gap: 8px;
	}

	.isbn-row input {
		flex: 1;
	}

	.btn-lookup {
		padding: 12px 16px;
		font-size: 16px;
		background: #10b981;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		white-space: nowrap;
		min-width: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn-lookup:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.lookup-error {
		color: #dc2626;
		font-size: 14px;
		margin: 4px 0 0;
	}

	.cover-preview {
		margin-bottom: 16px;
		text-align: center;
	}

	.cover-preview img {
		max-width: 120px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.ar-badge {
		display: inline-block;
		font-size: 11px;
		padding: 2px 6px;
		border-radius: 4px;
		margin-left: 8px;
		vertical-align: middle;
	}

	.ar-badge.fetched {
		background: #dbeafe;
		color: #1d4ed8;
	}

	.ar-badge.manual {
		background: #fef3c7;
		color: #92400e;
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
</style>
