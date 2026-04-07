<script lang="ts">
	import type { ProgressEvent, ProgressEventType } from '$lib/db';

	interface Props {
		events: ProgressEvent[];
	}

	let { events }: Props = $props();

	function getEventIcon(type: ProgressEventType): string {
		switch (type) {
			case 'book_added':
				return '📚';
			case 'marked_read':
				return '✅';
			case 'quiz_completed':
				return '📝';
			case 'notes_added':
				return '✎';
			default:
				return '•';
		}
	}

	function getEventLabel(type: ProgressEventType): string {
		switch (type) {
			case 'book_added':
				return 'Book added to library';
			case 'marked_read':
				return 'Marked as read';
			case 'quiz_completed':
				return 'Quiz completed';
			case 'notes_added':
				return 'Notes updated';
			default:
				return type;
		}
	}

	function formatDate(date: number | Date): string {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<div class="progress-timeline">
	<div class="timeline-header">
		<p class="eyebrow">Reading log</p>
		<h3>Timeline</h3>
	</div>

	{#if events.length === 0}
		<p class="no-events">No activity yet.</p>
	{:else}
		<ul class="timeline">
			{#each events as event (event.id ?? `${event.eventType}-${event.eventDate}`)}
				<li class="timeline-event">
					<div class="icon-wrap" aria-hidden="true">
						<span class="icon">{getEventIcon(event.eventType)}</span>
					</div>
					<div class="event-content">
						<div class="event-header">
							<span class="event-label">{getEventLabel(event.eventType)}</span>
							<span class="event-date">{formatDate(event.eventDate)}</span>
						</div>
						{#if event.value}
							<p class="event-value">{event.value}</p>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.progress-timeline {
		display: grid;
		gap: 1rem;
	}

	.timeline-header,
	.timeline-header h3,
	.no-events,
	.event-value {
		margin: 0;
	}

	.timeline-header h3 {
		font-family: var(--font-serif);
		font-size: 1.45rem;
		color: var(--text-strong);
	}

	.no-events {
		padding: 1rem;
		border-radius: var(--radius-sm);
		background: rgba(255, 251, 244, 0.82);
		color: var(--text-muted);
	}

	.timeline {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 1rem;
	}

	.timeline-event {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.9rem;
	}

	.icon-wrap {
		position: relative;
		display: grid;
		place-items: center;
		width: 2.5rem;
	}

	.icon-wrap::after {
		content: '';
		position: absolute;
		top: 2.7rem;
		bottom: -1rem;
		left: 50%;
		width: 2px;
		transform: translateX(-50%);
		background: linear-gradient(180deg, rgba(111, 141, 114, 0.4), rgba(111, 141, 114, 0));
	}

	.timeline-event:last-child .icon-wrap::after {
		display: none;
	}

	.icon {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 999px;
		background: var(--surface-strong);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
	}

	.event-content {
		display: grid;
		gap: 0.35rem;
		padding: 0.8rem 0.9rem;
		border-radius: var(--radius-sm);
		background: rgba(255, 252, 247, 0.8);
		border: 1px solid var(--border-subtle);
	}

	.event-header {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		align-items: baseline;
	}

	.event-label {
		font-weight: 700;
		color: var(--text-strong);
	}

	.event-date {
		font-size: 0.82rem;
		color: var(--text-muted);
	}

	.event-value {
		font-size: 0.92rem;
		line-height: 1.5;
		color: var(--text-default);
		white-space: pre-wrap;
	}

	@media (max-width: 480px) {
		.event-header {
			flex-direction: column;
			align-items: start;
		}
	}
</style>
