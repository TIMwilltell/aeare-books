<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { addBook } from '$lib/db';
	import { lookupBook } from '$lib/api/books';
	import { lookupAr } from '$lib/api/ar';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';
	import SecondaryButton from '$lib/components/SecondaryButton.svelte';
	import Badge from '$lib/components/Badge.svelte';

	let isbn = $state('');
	let title = $state('');
	let author = $state('');
	let coverUrl = $state('');
	// Store as strings for TextInput binding, convert to numbers on save
	let arLevelStr = $state('');
	let arPointsStr = $state('');
	let arDataSource = $state<'fetched' | 'manual'>('manual');
	let saving = $state(false);
	let lookupLoading = $state(false);
	let lookupError = $state('');
	let arLookupError = $state('');

	// Pre-fill ISBN from URL param
	isbn = page.url.searchParams.get('isbn') || '';

	async function handleLookup() {
		if (!isbn.trim()) return;

		lookupLoading = true;
		lookupError = '';
		arLookupError = '';

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
				arLevelStr = String(arResult.data.arLevel || '');
				arPointsStr = String(arResult.data.arPoints || '');
				arDataSource = 'fetched';
			} else if (arResult.error) {
				arLookupError = arResult.error;
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

		// Convert string inputs to numbers
		const arLevel = arLevelStr ? parseFloat(arLevelStr) : undefined;
		const arPoints = arPointsStr ? parseFloat(arPointsStr) : undefined;

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
	<!-- Header with glassmorphism -->
	<header class="page-header">
		<div class="header-content">
			<SecondaryButton label="← Back" onclick={handleCancel} />
			<h1 class="header-title">Add Book</h1>
			<div class="header-spacer"></div>
		</div>
	</header>

	<main class="form-container">
		<form onsubmit={(e) => { e.preventDefault(); handleSave(); }}>
			<!-- ISBN Lookup -->
			<div class="form-group">
				<TextInput
					label="ISBN"
					placeholder="Enter ISBN (optional)"
					bind:value={isbn}
					type="text"
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
			{#if arLookupError}
				<p class="ar-lookup-error">AR: {arLookupError}</p>
			{/if}

			<!-- Cover Preview -->
			{#if coverUrl}
				<div class="cover-preview">
					<img src={coverUrl} alt="Book cover" />
				</div>
			{/if}

			<!-- Title -->
			<div class="form-group">
				<TextInput
					label="Title"
					placeholder="Enter book title"
					bind:value={title}
					type="text"
					required={true}
				/>
			</div>

			<!-- Author -->
			<div class="form-group">
				<TextInput
					label="Author"
					placeholder="Enter author name"
					bind:value={author}
					type="text"
					required={true}
				/>
			</div>

			<!-- AR Level -->
			<div class="form-group">
				<TextInput
					label="AR Level"
					placeholder="e.g., 4.5"
					bind:value={arLevelStr}
					type="text"
				/>
				{#if arDataSource === 'fetched' && arLevelStr}
					<Badge label="Auto-fetched" variant="ar-fetched" size="sm" />
				{:else if arLevelStr}
					<Badge label="Manual" variant="ar-manual" size="sm" />
				{/if}
			</div>

			<!-- AR Points -->
			<div class="form-group">
				<TextInput
					label="AR Points"
					placeholder="e.g., 5"
					bind:value={arPointsStr}
					type="text"
				/>
			</div>

			<!-- Form Actions -->
			<div class="form-actions">
				<SecondaryButton 
					label="Cancel" 
					onclick={handleCancel} 
					disabled={saving}
					fullWidth={true} 
				/>
				<PrimaryButton 
					label={saving ? 'Saving...' : 'Save'} 
					onclick={handleSave}
					disabled={saving}
					fullWidth={true}
					loading={saving}
				/>
			</div>
		</form>
	</main>
</div>

<style>
	.book-form {
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

	.form-container {
		max-width: 500px;
		margin: 0 auto;
		padding: var(--space-4);
	}

	.form-group {
		margin-bottom: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.btn-lookup {
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		background: var(--tertiary);
		color: var(--on-tertiary);
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		white-space: nowrap;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform var(--transition-fast);
	}

	.btn-lookup:hover:not(:disabled) {
		transform: scale(1.02);
	}

	.btn-lookup:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.lookup-error {
		color: var(--error);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		margin: calc(-1 * var(--space-2)) 0 var(--space-2);
	}

	.ar-lookup-error {
		color: var(--tertiary);
		font-family: var(--font-body);
		font-size: var(--text-sm);
		margin: calc(-1 * var(--space-2)) 0 var(--space-2);
	}

	.cover-preview {
		margin-bottom: var(--space-4);
		text-align: center;
	}

	.cover-preview img {
		max-width: 120px;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-elevated);
	}

	.form-actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-top: var(--space-6);
	}
</style>
