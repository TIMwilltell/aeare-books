<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { getAllBooks, searchBooks, type Book } from '$lib/db';
	import BookList from '$lib/components/BookList.svelte';
	import FAB from '$lib/components/FAB.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

	let books = $state<Book[]>([]);
	let searchQuery = $state('');
	let loading = $state(true);

	onMount(async () => {
		books = await getAllBooks();
		loading = false;
	});

	async function handleSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
		books = await searchBooks(searchQuery);
	}

	function handleBookSelect(id: string) {
		goto(`/book/${id}`);
	}

	function handleScan() {
		goto('/scan');
	}
</script>

<svelte:head>
	<title>AeAre Books</title>
</svelte:head>

<div class="library-page">
	<header class="library-header">
		<h1 class="serif">My Library</h1>
		<div class="search">
			<TextInput 
				label="Search"
				placeholder="Search by title or author..."
				value={searchQuery}
				oninput={handleSearch}
			/>
		</div>
	</header>
	
	<main class="library-content">
		{#if loading}
			<div class="loading">
				<LoadingSpinner size="large" />
			</div>
		{:else if books.length === 0}
			<EmptyState 
				title="Your library is empty"
				description="Start by scanning a book barcode to add your first book!"
				actionLabel="Scan a Book"
				onAction={handleScan}
			/>
		{:else}
			<BookList {books} onSelect={handleBookSelect} />
		{/if}
	</main>
	
	<FAB onclick={handleScan} />
</div>

<style>
	.library-page {
		min-height: 100vh;
		background: var(--surface, #f5f5f5);
	}

	.library-header {
		padding: var(--space-4);
		background: rgba(251, 249, 248, 0.8);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.library-header h1 {
		font-family: var(--font-serif, 'Noto Serif', Georgia, serif);
		font-size: var(--text-headline-sm, 1.5rem);
		font-weight: 600;
		margin: 0 0 var(--space-4) 0;
		color: var(--on-surface, #1a1a1a);
	}

	.search {
		width: 100%;
	}

	.library-content {
		padding: var(--space-4);
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 200px;
	}
</style>
