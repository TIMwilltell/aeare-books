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
	<h3>Progress</h3>
	{#if events.length === 0}
		<p class="no-events">No progress recorded yet</p>
	{:else}
		<ul class="timeline">
			{#each events as event}
				<li class="timeline-event">
					<span class="icon">{getEventIcon(event.eventType)}</span>
					<div class="event-content">
						<span class="event-label">{getEventLabel(event.eventType)}</span>
						<span class="event-date">{formatDate(event.eventDate)}</span>
						{#if event.value}
							<span class="event-value">{event.value}</span>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.progress-timeline {
		margin-top: 24px;
		padding-top: 24px;
		border-top: 1px solid #eee;
	}
	
	h3 {
		font-size: 18px;
		margin: 0 0 16px;
		color: #333;
	}
	
	.no-events {
		color: #888;
		font-style: italic;
	}
	
	.timeline {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	
	.timeline-event {
		display: flex;
		gap: 12px;
		padding: 12px 0;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.timeline-event:last-child {
		border-bottom: none;
	}
	
	.icon {
		font-size: 18px;
	}
	
	.event-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	
	.event-label {
		font-weight: 500;
		color: #333;
	}
	
	.event-date {
		font-size: 13px;
		color: #888;
	}
	
	.event-value {
		font-size: 14px;
		color: #4a90d9;
		margin-top: 4px;
	}
</style>