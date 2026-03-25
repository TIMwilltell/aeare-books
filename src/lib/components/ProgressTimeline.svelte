<script lang="ts">
	import type { ProgressEvent, ProgressEventType } from '$lib/db';
	
	interface Props {
		events: ProgressEvent[];
	}
	
	let { events }: Props = $props();
	
	function getEventIcon(type: ProgressEventType): string {
		switch (type) {
			case 'book_added': return '📚';
			case 'marked_read': return '✅';
			case 'quiz_completed': return '📝';
			case 'notes_added': return '📝';
			default: return '•';
		}
	}
	
	function getEventLabel(type: ProgressEventType): string {
		switch (type) {
			case 'book_added': return 'Book added to library';
			case 'marked_read': return 'Marked as read';
			case 'quiz_completed': return 'Quiz completed';
			case 'notes_added': return 'Notes updated';
			default: return type;
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
	<h3 class="timeline-heading">Progress</h3>
	{#if events.length === 0}
		<p class="no-events">No progress recorded yet</p>
	{:else}
		<div class="timeline">
			{#each events as event, i}
				<div class="timeline-item">
					<div class="timeline-marker">
						{#if i < events.length - 1}
							<div class="timeline-line"></div>
						{/if}
					</div>
					<div class="timeline-content">
						<span class="event-icon">{getEventIcon(event.eventType)}</span>
						<div class="event-details">
							<span class="event-label">{getEventLabel(event.eventType)}</span>
							<span class="event-date">{formatDate(event.eventDate)}</span>
							{#if event.value}
								<span class="event-value">{event.value}</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.progress-timeline {
		margin-top: var(--space-6);
		padding-top: var(--space-6);
		border-top: 1px solid var(--outline-variant);
	}
	
	.timeline-heading {
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--font-semibold);
		color: var(--on-surface);
		margin: 0 0 var(--space-4);
	}
	
	.no-events {
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--on-surface-variant);
		font-style: italic;
		margin: 0;
	}
	
	.timeline {
		padding: var(--space-4);
		background: var(--surface-container-low);
		border-radius: var(--radius-md);
	}
	
	.timeline-item {
		display: flex;
		gap: var(--space-4);
		padding-bottom: var(--space-4);
	}
	
	.timeline-item:last-child {
		padding-bottom: 0;
	}
	
	.timeline-marker {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--primary);
		margin-top: 6px;
		flex-shrink: 0;
		position: relative;
	}
	
	.timeline-line {
		position: absolute;
		top: 12px;
		left: 3px;
		width: 2px;
		height: calc(100% + var(--space-2));
		background: var(--outline-variant);
	}
	
	.timeline-content {
		display: flex;
		gap: var(--space-3);
		flex: 1;
	}
	
	.event-icon {
		font-size: var(--text-lg);
		flex-shrink: 0;
	}
	
	.event-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	
	.event-label {
		font-family: var(--font-body);
		font-weight: var(--font-medium);
		color: var(--on-surface);
		font-size: var(--text-base);
	}
	
	.event-date {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--on-surface-variant);
	}
	
	.event-value {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--primary);
		font-weight: var(--font-medium);
		margin-top: var(--space-1);
	}
</style>
