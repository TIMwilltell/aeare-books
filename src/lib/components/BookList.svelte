<script lang="ts">
	import type { Book } from '$lib/db';
	import BookCard from './BookCard.svelte';

	interface Props {
		books: Book[];
		onSelect: (id: string) => void;
	}

	let { books, onSelect }: Props = $props();
</script>

{#if books.length === 0}
	<div class="empty-list">
		<p>No books in your library yet.</p>
	</div>
{:else}
	<div class="book-list">
		{#each books as book (book.id)}
			<BookCard 
				title={book.title}
				author={book.author}
				thumbnailUrl={book.coverUrl}
				arLevel={book.arLevel}
				arPoints={book.arPoints}
				arDataSource={book.arDataSource}
				onClick={() => book.id && onSelect(book.id)}
			/>
		{/each}
	</div>
{/if}

<style>
	.book-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.empty-list {
		text-align: center;
		padding: var(--space-8);
		color: var(--on-surface-variant);
	}
</style>
