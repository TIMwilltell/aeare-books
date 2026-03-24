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
					<div class="book-cover">
						{#if book.coverUrl}
							<img src={book.coverUrl} alt="{book.title} cover" />
						{:else}
							<div class="cover-placeholder">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
									<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
								</svg>
							</div>
						{/if}
					</div>
					<div class="book-info">
						<span class="book-title">{book.title}</span>
						<span class="book-author">by {book.author}</span>
						{#if book.arLevel}
							<span class="ar-info">
								AR {book.arLevel}
								{#if book.arPoints}
									<span class="ar-points">• {book.arPoints} pts</span>
								{/if}
							</span>
						{/if}
					</div>
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
		gap: 12px;
		padding: 12px;
		background: white;
		border: none;
		border-bottom: 1px solid #eee;
		cursor: pointer;
		text-align: left;
	}

	.book-row:hover {
		background: #f9f9f9;
	}

	.book-cover {
		flex-shrink: 0;
		width: 48px;
		height: 64px;
		border-radius: 4px;
		overflow: hidden;
		background: #f0f0f0;
	}

	.book-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ccc;
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

	.ar-info {
		font-size: 13px;
		color: #4a90d9;
		font-weight: 500;
	}

	.ar-points {
		font-weight: normal;
		opacity: 0.8;
	}
</style>
