<script lang="ts">
	import type { Book } from '$lib/db';

	interface Props {
		books: Book[];
		onSelect: (id: number) => void;
	}

	let { books, onSelect }: Props = $props();
</script>

{#if books.length === 0}
	<div class="empty-list">
		<p>No books in your library yet.</p>
	</div>
{:else}
	<ul class="book-list">
		{#each books as book (book.id)}
			<li>
				<button class="book-row" onclick={() => book.id && onSelect(book.id)}>
					<div class="book-info">
						<span class="book-title">{book.title}</span>
						<span class="book-author">{book.author}</span>
					</div>
					{#if book.arLevel}
						<span class="ar-badge">
							AR {book.arLevel}
							{#if book.arPoints}
								<span class="ar-points">({book.arPoints})</span>
							{/if}
						</span>
					{/if}
				</button>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.book-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.empty-list {
		text-align: center;
		padding: 40px 20px;
		color: #888;
	}

	.empty-list p {
		margin: 0;
	}

	.book-row {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px;
		background: white;
		border: none;
		border-bottom: 1px solid #eee;
		cursor: pointer;
		text-align: left;
	}

	.book-row:hover {
		background: #f9f9f9;
	}

	.book-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
		min-width: 0;
	}

	.book-title {
		font-size: 16px;
		font-weight: 500;
		color: #333;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.book-author {
		font-size: 14px;
		color: #666;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ar-badge {
		flex-shrink: 0;
		padding: 4px 8px;
		background: #e0e7ff;
		color: #4A90D9;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
		margin-left: 12px;
	}

	.ar-points {
		opacity: 0.8;
	}
</style>
