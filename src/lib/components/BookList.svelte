<script lang="ts">
	import type { Book } from '$lib/db';

	interface Props {
		books: Book[];
		onSelect: (id: string) => void;
	}

	let { books, onSelect }: Props = $props();

	function getInitials(title: string) {
		return title
			.split(' ')
			.slice(0, 2)
			.map((part) => part[0])
			.join('')
			.toUpperCase();
	}
</script>

{#if books.length === 0}
	<div class="empty-list section-card">
		<p>No books match this search yet.</p>
	</div>
{:else}
	<ul class="book-list" aria-label="Books">
		{#each books as book (book.id)}
			<li>
				<button class="book-card section-card" onclick={() => book.id && onSelect(book.id)}>
					<div class="book-cover">
						{#if book.coverUrl}
							<img src={book.coverUrl} alt="{book.title} cover" />
						{:else}
							<div class="cover-placeholder" aria-hidden="true">
								<span>{getInitials(book.title)}</span>
							</div>
						{/if}
					</div>

					<div class="book-info">
						<div class="book-topline">
							{#if book.arLevel}
								<span class="pill ar-pill">AR {book.arLevel}</span>
							{/if}
						</div>

						<div class="title-block">
							<span class="book-title">{book.title}</span>
							<span class="book-author">{book.author}</span>
						</div>

						<div class="book-meta">
							{#if book.arPoints}
								<span>{book.arPoints} AR pts</span>
							{/if}
							{#if book.isbn}
								<span class="isbn">ISBN {book.isbn}</span>
							{/if}
						</div>
					</div>

					<span class="chevron" aria-hidden="true">View</span>
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
		display: grid;
		gap: 0.9rem;
	}

	.empty-list {
		padding: 1.5rem;
		text-align: center;
		color: var(--text-muted);
	}

	.empty-list p {
		margin: 0;
	}

	.book-card {
		width: 100%;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1rem;
		padding: 0.95rem;
		border: 1px solid var(--border-subtle);
		cursor: pointer;
		text-align: left;
		transition: transform var(--transition-soft), box-shadow var(--transition-soft), border-color var(--transition-soft);
	}

	.book-card:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-card);
		border-color: var(--border-strong);
	}

	.book-cover {
		width: 4.2rem;
		height: 5.8rem;
		flex-shrink: 0;
		border-radius: 1rem;
		overflow: hidden;
		background: linear-gradient(180deg, #e7dac6, #dccdb5);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
	}

	.book-cover img,
	.cover-placeholder {
		width: 100%;
		height: 100%;
	}

	.book-cover img {
		object-fit: cover;
	}

	.cover-placeholder {
		display: grid;
		place-items: center;
		color: rgba(38, 31, 26, 0.78);
		font-family: var(--font-serif);
		font-size: 1.15rem;
		font-weight: 700;
	}

	.book-info {
		min-width: 0;
		display: grid;
		gap: 0.7rem;
	}

	.book-topline,
	.book-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.ar-pill {
		background: rgba(240, 201, 119, 0.22);
		color: #8b6321;
	}

	.title-block {
		display: grid;
		gap: 0.25rem;
	}

	.book-title {
		font-family: var(--font-serif);
		font-size: 1.22rem;
		line-height: 1.12;
		color: var(--text-strong);
		line-clamp: 2;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.book-author {
		font-size: 0.95rem;
		color: var(--text-default);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.book-meta {
		font-size: 0.82rem;
		color: var(--text-muted);
	}

	.isbn {
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}

	.chevron {
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	@media (max-width: 420px) {
		.book-card {
			grid-template-columns: auto 1fr;
		}

		.chevron {
			display: none;
		}
	}
</style>
