<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getAllBooks, searchBooks, type Book } from '$lib/db';
	import { exportLibrary } from '$lib/api/export';
	import BookList from '$lib/components/BookList.svelte';
	import FAB from '$lib/components/FAB.svelte';

	let books = $state<Book[]>([]);
	let searchQuery = $state('');
	let loading = $state(true);

	onMount(async () => {
		books = await getAllBooks();
		loading = false;
	});

	async function handleSearch() {
		books = await searchBooks(searchQuery);
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
	<div class="header">
		<div class="search-bar">
			<input
				type="text"
				placeholder="Search by title or author..."
				bind:value={searchQuery}
				oninput={handleSearch}
			/>
		</div>
		<button class="export-btn" onclick={handleExport}>
			📥 Export
		</button>
	</div>

	{#if loading}
		<div class="loading">
			<p>Loading your library...</p>
		</div>
	{:else if books.length === 0}
		<div class="empty-state">
			<h2>Your library is empty</h2>
			<p>Start by scanning a book barcode to add your first book!</p>
			<button class="btn-scan" onclick={handleScan}>Scan a Book</button>
		</div>
	{:else}
		<BookList {books} onSelect={handleBookSelect} />
	{/if}

	<FAB onclick={handleScan} />
</div>

<style>
	.library-page {
		min-height: 100vh;
		background: #f5f5f5;
		padding-bottom: 80px;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 16px;
		background: white;
		border-bottom: 1px solid #eee;
	}

	.search-bar {
		flex: 1;
	}

	.search-bar input {
		width: 100%;
		padding: 12px 16px;
		font-size: 16px;
		border: 1px solid #ddd;
		border-radius: 24px;
		box-sizing: border-box;
	}

	.search-bar input:focus {
		outline: none;
		border-color: #4A90D9;
	}

	.export-btn {
		padding: 10px 16px;
		background: #f3f4f6;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 4px;
		white-space: nowrap;
	}

	.export-btn:hover {
		background: #e5e7eb;
	}

	.loading {
		text-align: center;
		padding: 60px 20px;
		color: #666;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
	}

	.empty-state h2 {
		margin: 0 0 12px;
		font-size: 20px;
		color: #333;
	}

	.empty-state p {
		margin: 0 0 24px;
		color: #666;
	}

	.btn-scan {
		padding: 14px 28px;
		font-size: 16px;
		background: #4A90D9;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}

	.btn-scan:hover {
		background: #3a7bc8;
	}
</style>
