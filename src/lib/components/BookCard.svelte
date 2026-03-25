<script lang="ts">
	interface BookCardProps {
		title: string;
		author: string;
		thumbnailUrl?: string;
		arLevel?: number;
		arPoints?: number;
		arDataSource?: 'fetched' | 'manual';
		onClick?: () => void;
	}

	let {
		title,
		author,
		thumbnailUrl,
		arLevel,
		arPoints,
		arDataSource = 'manual',
		onClick
	}: BookCardProps = $props();

	const badgeVariant = arDataSource === 'fetched' ? 'ar-fetched' : 'ar-manual';
</script>

<button class="book-card" onclick={onClick} aria-label="View {title}">
	<div class="thumbnail">
		{#if thumbnailUrl}
			<img src={thumbnailUrl} alt="{title} cover" />
		{:else}
			<div class="thumbnail-placeholder">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
				</svg>
			</div>
		{/if}
	</div>
	<div class="info">
		<h3 class="title">{title}</h3>
		<p class="author">{author}</p>
		{#if arLevel !== undefined}
			<div class="badges">
				<span class="badge {badgeVariant}">
					AR {arLevel}
					{#if arPoints}
						<span class="points">{arPoints} pts</span>
					{/if}
				</span>
			</div>
		{/if}
	</div>
</button>

<style>
	.book-card {
		display: flex;
		gap: 12px;
		padding: 12px;
		background: var(--surface-container-lowest, #fafafa);
		border: none;
		border-radius: var(--radius-md, 0.75rem);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		cursor: pointer;
		text-align: left;
		width: 100%;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.book-card:hover {
		transform: scale(1.01);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
	}

	.book-card:active {
		transform: scale(0.99);
	}

	.book-card:focus-visible {
		outline: 2px solid var(--primary, #4A90D9);
		outline-offset: 2px;
	}

	.thumbnail {
		flex-shrink: 0;
		width: 60px;
		height: 90px;
		border-radius: var(--radius-md, 0.75rem);
		overflow: hidden;
		background: var(--surface-container-low, #f0f0f0);
	}

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.thumbnail-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--on-surface-variant, #666);
		background: var(--surface-container-low, #f0f0f0);
	}

	.thumbnail-placeholder svg {
		width: 32px;
		height: 32px;
	}

	.info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}

	.title {
		font-family: var(--font-serif, 'Noto Serif', Georgia, serif);
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--on-surface, #1a1a1a);
		margin: 0;
		line-height: 1.3;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.author {
		font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
		font-size: 1rem;
		color: var(--on-surface-variant, #666);
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.badges {
		margin-top: 4px;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.badge.ar-fetched {
		background: var(--ar-fetched-bg, #dbeafe);
		color: var(--ar-fetched-text, #1e40af);
	}

	.badge.ar-manual {
		background: var(--ar-manual-bg, #fef3c7);
		color: var(--ar-manual-text, #92400e);
	}

	.points {
		opacity: 0.8;
	}
</style>