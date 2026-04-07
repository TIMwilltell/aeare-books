<script lang="ts">
	import { dev } from '$app/environment';

	type InboxMessage = {
		email: string;
		url: string;
		token: string;
		subject: string;
		html: string;
		text: string;
		expiresAt: number;
		createdAt: number;
	};

	type InboxResponse = {
		enabled: boolean;
		latest?: InboxMessage | null;
		error?: string;
	};

	let email = $state('reader@example.com');
	let loading = $state(false);
	let clearing = $state(false);
	let error = $state<string | null>(null);
	let latest = $state<InboxMessage | null>(null);

	function rewriteMagicLink(url: string) {
		const magicLink = new URL(url);
		magicLink.protocol = window.location.protocol;
		magicLink.hostname = window.location.hostname;
		magicLink.port = window.location.port;
		return magicLink.toString();
	}

	async function loadLatest() {
		if (!dev || !email.trim()) {
			return;
		}

		loading = true;
		error = null;

		try {
			const response = await fetch(`/api/test/auth-email?email=${encodeURIComponent(email.trim())}`);
			const body = (await response.json()) as InboxResponse;

			if (!response.ok || !body.enabled) {
				throw new Error(body.error ?? 'Local inbox is unavailable.');
			}

			latest = body.latest ?? null;
		} catch (fetchError) {
			latest = null;
			error = fetchError instanceof Error ? fetchError.message : 'Failed to load inbox message.';
		} finally {
			loading = false;
		}
	}

	async function clearInbox() {
		if (!dev || !email.trim()) {
			return;
		}

		clearing = true;
		error = null;

		try {
			const response = await fetch(`/api/test/auth-email?email=${encodeURIComponent(email.trim())}`, {
				method: 'DELETE'
			});

			if (!response.ok && response.status !== 204) {
				const body = (await response.json()) as InboxResponse;
				throw new Error(body.error ?? 'Failed to clear inbox message.');
			}

			latest = null;
		} catch (fetchError) {
			error = fetchError instanceof Error ? fetchError.message : 'Failed to clear inbox message.';
		} finally {
			clearing = false;
		}
	}
</script>

<svelte:head>
	<title>Dev Inbox - AeAre Books</title>
</svelte:head>

<div class="dev-inbox-page">
	<section class="section-card intro">
		<p class="eyebrow">Development tools</p>
		<h1>Magic-link inbox</h1>
		<p>
			Inspect the latest locally captured sign-in email when `AEARE_AUTH_EMAIL_MODE=local` is enabled on the
			Convex dev deployment.
		</p>
	</section>

	{#if !dev}
		<section class="section-card status-card error-card">
			<h2>Unavailable outside local development.</h2>
			<p>This page is only intended for the local dev server.</p>
		</section>
	{:else}
		<section class="section-card controls-card">
			<label class="field" for="inbox-email">
				<span>Email address</span>
				<input id="inbox-email" type="email" bind:value={email} placeholder="reader@example.com" />
			</label>

			<div class="actions-row">
				<button class="primary-button" type="button" onclick={loadLatest} disabled={loading || !email.trim()}>
					{loading ? 'Loading…' : 'Load latest message'}
				</button>
				<button class="ghost-button" type="button" onclick={clearInbox} disabled={clearing || !email.trim()}>
					{clearing ? 'Clearing…' : 'Clear inbox'}
				</button>
			</div>
		</section>

		{#if error}
			<section class="section-card status-card error-card" role="alert">
				<h2>Inbox request failed.</h2>
				<p>{error}</p>
			</section>
		{:else if latest}
			<section class="section-card message-card">
				<div class="message-header">
					<div>
						<p class="eyebrow">Latest message</p>
						<h2>{latest.subject}</h2>
					</div>
					<p class="timestamp">Saved {new Date(latest.createdAt).toLocaleString()}</p>
				</div>

				<dl class="message-meta">
					<div>
						<dt>Email</dt>
						<dd>{latest.email}</dd>
					</div>
					<div>
						<dt>Expires</dt>
						<dd>{new Date(latest.expiresAt).toLocaleString()}</dd>
					</div>
					<div>
						<dt>Token</dt>
						<dd class="token">{latest.token}</dd>
					</div>
				</dl>

				<div class="link-actions">
					<a class="primary-button link-button" href={rewriteMagicLink(latest.url)}>Open local magic link</a>
					<a class="ghost-button link-button" href={latest.url} target="_blank" rel="noreferrer">Open original link</a>
				</div>

				<div class="message-panels">
					<section class="message-panel surface-muted">
						<h3>Text body</h3>
						<pre>{latest.text}</pre>
					</section>

					<section class="message-panel surface-muted">
						<h3>HTML body</h3>
						<iframe title="Magic link email preview" srcdoc={latest.html} sandbox=""></iframe>
					</section>
				</div>
			</section>
		{:else}
			<section class="section-card status-card">
				<h2>No captured message yet.</h2>
				<p>Request a sign-in link, then load the latest message for the email above.</p>
			</section>
		{/if}
	{/if}
</div>

<style>
	.dev-inbox-page {
		display: grid;
		gap: 1rem;
	}

	.intro,
	.controls-card,
	.status-card,
	.message-card {
		display: grid;
		gap: 1rem;
	}

	.intro p:last-child,
	.status-card p,
	.message-panel h3,
	.message-panel pre,
	.message-meta dd,
	.message-meta dt {
		margin: 0;
	}

	.field {
		display: grid;
		gap: 0.45rem;
	}

	.field span,
	.message-meta dt,
	.timestamp {
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.actions-row,
	.link-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.link-button {
		justify-content: center;
		text-decoration: none;
	}

	.error-card {
		border: 1px solid rgba(185, 85, 71, 0.25);
	}

	.message-header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: start;
		flex-wrap: wrap;
	}

	.message-meta {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
		padding: 0;
	}

	.message-meta div {
		display: grid;
		gap: 0.25rem;
		padding: 0.9rem;
		border-radius: var(--radius-sm);
		background: var(--surface-muted);
	}

	.token {
		font-family: var(--font-mono);
		font-size: 0.86rem;
		word-break: break-all;
	}

	.message-panels {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.message-panel {
		display: grid;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: var(--radius-sm);
	}

	.message-panel pre {
		font-family: var(--font-mono);
		white-space: pre-wrap;
		word-break: break-word;
		line-height: 1.5;
	}

	.message-panel iframe {
		width: 100%;
		min-height: 24rem;
		border: 1px solid var(--border-subtle);
		border-radius: 1rem;
		background: white;
	}

	@media (max-width: 720px) {
		.message-meta,
		.message-panels {
			grid-template-columns: 1fr;
		}

		.message-panel iframe {
			min-height: 18rem;
		}
	}
</style>
