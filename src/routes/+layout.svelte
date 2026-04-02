<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import StatusBanner from '$lib/components/StatusBanner.svelte';
	import { authState, fetchAccessToken, initAuthSession, signIn, signOut } from '$lib/auth/auth0';
	import { setupConvex, useConvexClient } from 'convex-svelte';
	import { onMount } from 'svelte';

	const { children } = $props();
	let authActionPending = $state(false);
	let authActionError = $state<string | null>(null);

	setupConvex(import.meta.env.VITE_CONVEX_URL ?? 'https://jovial-wildcat-461.convex.cloud');

	const convexClient = useConvexClient();
	convexClient.setAuth(fetchAccessToken);

	onMount(() => {
		void initAuthSession();
	});

	async function handleSignIn() {
		authActionPending = true;
		authActionError = null;

		try {
			await signIn();
		} catch (error) {
			authActionError = error instanceof Error ? error.message : 'Sign-in failed. Please try again.';
			authActionPending = false;
		}
	}

	async function handleSignOut() {
		authActionPending = true;
		authActionError = null;

		try {
			await signOut();
		} catch (error) {
			authActionError = error instanceof Error ? error.message : 'Sign-out failed. Please try again.';
			authActionPending = false;
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a class="skip-link" href="#main-content">Skip to content</a>

	<div class="app-shell">
		<header class="app-frame" aria-label="Application frame">
		<div class="brand-row">
			<div class="brand-mark" aria-hidden="true">Ae</div>
			<div class="brand-copy">
				<p class="eyebrow">Reading companion</p>
				<p class="brand-title">AeAre Books</p>
			</div>
		</div>
		<StatusBanner />
		<section class="auth-shell" aria-live="polite">
			{#if $authState.status === 'loading'}
				<p class="auth-copy">Checking session…</p>
			{:else if $authState.status === 'signed-out'}
				<div class="auth-row">
					<p class="auth-copy">Signed out</p>
					<button class="primary-button" type="button" onclick={handleSignIn} disabled={authActionPending}>
						{authActionPending ? 'Starting sign in…' : 'Sign in'}
					</button>
				</div>
			{:else if $authState.status === 'signed-in'}
				<div class="auth-row">
					<p class="auth-copy">
						Signed in{#if $authState.user?.name} as <strong>{$authState.user.name}</strong>{/if}
					</p>
					<button class="ghost-button" type="button" onclick={handleSignOut} disabled={authActionPending}>
						{authActionPending ? 'Signing out…' : 'Sign out'}
					</button>
				</div>
			{:else}
				<div class="auth-error" role="alert">
					<p class="auth-copy">Authentication is not configured.</p>
					{#if $authState.error}
						<p class="auth-error-copy">{$authState.error}</p>
					{/if}
				</div>
			{/if}

			{#if authActionError}
				<p class="auth-error-copy" role="alert">{authActionError}</p>
			{/if}
		</section>
	</header>

	<main id="main-content" class="page-shell">
		{@render children()}
	</main>
</div>

<style>
	:global(:root) {
		color-scheme: light;
		--font-sans: 'Avenir Next', 'Segoe UI', 'Helvetica Neue', system-ui, sans-serif;
		--font-serif: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif;
		--font-mono: 'SF Mono', 'Cascadia Code', 'Liberation Mono', monospace;

		--color-cream-0: #fffdf7;
		--color-cream-1: #f7f1e4;
		--color-cream-2: #efe6d4;
		--color-ink-1: #261f1a;
		--color-ink-2: #4a4139;
		--color-ink-3: #73685d;
		--color-moss-1: #46614f;
		--color-moss-2: #6f8d72;
		--color-coral-1: #d56f5b;
		--color-coral-2: #eea38e;
		--color-sun: #f0c977;
		--color-danger: #b95547;

		--surface-app: linear-gradient(180deg, #fbf6ee 0%, #f5efdf 52%, #f1e8d8 100%);
		--surface-elevated: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 250, 241, 0.88));
		--surface-muted: rgba(255, 250, 242, 0.72);
		--surface-strong: linear-gradient(135deg, #f7efe2 0%, #ede0ca 100%);
		--surface-accent: linear-gradient(135deg, #4f6858 0%, #738c74 100%);
		--surface-coral: linear-gradient(135deg, #c56f5f 0%, #dd9584 100%);

		--text-strong: var(--color-ink-1);
		--text-default: var(--color-ink-2);
		--text-muted: var(--color-ink-3);
		--text-on-accent: #fffdf8;

		--border-subtle: rgba(70, 51, 36, 0.1);
		--border-strong: rgba(70, 51, 36, 0.18);
		--shadow-soft: 0 10px 28px rgba(81, 59, 42, 0.09);
		--shadow-card: 0 12px 30px rgba(59, 42, 29, 0.1);
		--shadow-pressed: 0 8px 20px rgba(59, 42, 29, 0.16);

		--radius-xs: 10px;
		--radius-sm: 16px;
		--radius-md: 22px;
		--radius-lg: 30px;
		--radius-pill: 999px;

		--space-1: 0.25rem;
		--space-2: 0.5rem;
		--space-3: 0.75rem;
		--space-4: 1rem;
		--space-5: 1.25rem;
		--space-6: 1.5rem;
		--space-7: 1.75rem;
		--space-8: 2rem;
		--space-10: 2.5rem;
		--space-12: 3rem;

		--content-width: 46rem;
		--focus-ring: 0 0 0 3px rgba(213, 111, 91, 0.18), 0 0 0 1px rgba(213, 111, 91, 0.55);
		--transition-soft: 180ms ease;
	}

	:global(html) {
		background: #f7f1e4;
		font-family: var(--font-sans);
		color: var(--text-default);
	}

	:global(body) {
		margin: 0;
		min-height: 100vh;
		background: var(--surface-app);
		color: var(--text-default);
		font-family: var(--font-sans);
	}

	:global(*) {
		box-sizing: border-box;
	}

	:global(img) {
		display: block;
		max-width: 100%;
	}

	:global(button),
	:global(input),
	:global(textarea) {
		font: inherit;
	}

	:global(button) {
		touch-action: manipulation;
	}

	:global(a) {
		color: inherit;
	}

	:global(input[type='text']),
	:global(input[type='search']),
	:global(input[type='email']),
	:global(input[type='password']),
	:global(input[type='tel']),
	:global(input[type='url']),
	:global(input[type='number']),
	:global(textarea) {
		width: 100%;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
		background: rgba(255, 252, 246, 0.94);
		padding: 0.9rem 1rem;
		color: var(--text-strong);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
		transition: border-color var(--transition-soft), box-shadow var(--transition-soft), background var(--transition-soft);
	}

	:global(input[type='text']::placeholder),
	:global(input[type='search']::placeholder),
	:global(input[type='email']::placeholder),
	:global(input[type='password']::placeholder),
	:global(input[type='tel']::placeholder),
	:global(input[type='url']::placeholder),
	:global(input[type='number']::placeholder),
	:global(textarea::placeholder) {
		color: color-mix(in srgb, var(--text-muted) 78%, white);
	}

	:global(input[type='text']:focus-visible),
	:global(input[type='search']:focus-visible),
	:global(input[type='email']:focus-visible),
	:global(input[type='password']:focus-visible),
	:global(input[type='tel']:focus-visible),
	:global(input[type='url']:focus-visible),
	:global(input[type='number']:focus-visible),
	:global(textarea:focus-visible),
	:global(button:focus-visible),
	:global(a:focus-visible) {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	:global(.page-title) {
		margin: 0;
		font-family: var(--font-serif);
		font-size: clamp(2rem, 7vw, 3.3rem);
		line-height: 0.98;
		letter-spacing: -0.03em;
		color: var(--text-strong);
	}

	:global(.section-card) {
		background: var(--surface-elevated);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-soft);
		backdrop-filter: blur(8px);
	}

	:global(.surface-muted) {
		background: var(--surface-muted);
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-sm);
	}

	:global(.pill) {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.45rem 0.8rem;
		border-radius: var(--radius-pill);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.01em;
	}

	:global(.eyebrow) {
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--color-moss-1);
	}

	:global(.primary-button),
	:global(.secondary-button),
	:global(.ghost-button),
	:global(.danger-button) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		min-height: 2.95rem;
		padding: 0.8rem 1.1rem;
		border-radius: var(--radius-pill);
		border: 1px solid transparent;
		font-size: 0.98rem;
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
		transition: transform var(--transition-soft), box-shadow var(--transition-soft), background var(--transition-soft), border-color var(--transition-soft);
	}

	:global(.primary-button) {
		background: var(--surface-accent);
		color: var(--text-on-accent);
		box-shadow: 0 8px 18px rgba(70, 97, 79, 0.2);
	}

	:global(.secondary-button) {
		background: var(--surface-coral);
		color: var(--text-on-accent);
		box-shadow: 0 8px 18px rgba(213, 111, 91, 0.2);
	}

	:global(.ghost-button) {
		background: rgba(255, 252, 246, 0.78);
		border-color: var(--border-strong);
		color: var(--text-strong);
	}

	:global(.danger-button) {
		background: rgba(185, 85, 71, 0.12);
		border-color: rgba(185, 85, 71, 0.2);
		color: var(--color-danger);
	}

	:global(.primary-button:hover),
	:global(.secondary-button:hover),
	:global(.ghost-button:hover),
	:global(.danger-button:hover) {
		transform: translateY(-1px);
	}

	:global(.primary-button:disabled),
	:global(.secondary-button:disabled),
	:global(.ghost-button:disabled),
	:global(.danger-button:disabled) {
		opacity: 0.55;
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
	}

	.skip-link {
		position: absolute;
		left: 1rem;
		top: -3rem;
		z-index: 100;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-pill);
		background: var(--color-ink-1);
		color: var(--text-on-accent);
		text-decoration: none;
		transition: top var(--transition-soft);
	}

	.skip-link:focus {
		top: 1rem;
	}

	.app-shell {
		position: relative;
		min-height: 100vh;
		padding: max(1rem, env(safe-area-inset-top)) 1rem max(2rem, env(safe-area-inset-bottom));
		overflow: hidden;
	}

	.app-frame,
	.page-shell {
		position: relative;
		z-index: 1;
		max-width: var(--content-width);
		margin: 0 auto;
	}

	.app-frame {
		display: grid;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.brand-row {
		display: flex;
		align-items: center;
		gap: 0.95rem;
		padding: 0.5rem 0.15rem 0;
	}

	.brand-mark {
		display: grid;
		place-items: center;
		width: 3rem;
		height: 3rem;
		border-radius: 1rem;
		background: linear-gradient(135deg, rgba(191, 108, 92, 0.92), rgba(219, 190, 128, 0.9));
		color: #fffaf2;
		font-family: var(--font-serif);
		font-size: 1.3rem;
		font-weight: 700;
		box-shadow: 0 6px 14px rgba(153, 95, 82, 0.2);
	}

	.brand-copy {
		display: grid;
		gap: 0.15rem;
	}

	.brand-title {
		margin: 0;
		font-family: var(--font-serif);
		font-size: 1.35rem;
		color: var(--text-strong);
	}

	.auth-shell {
		display: grid;
		gap: 0.55rem;
		padding: 0.85rem 1rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border-subtle);
		background: rgba(255, 252, 246, 0.76);
	}

	.auth-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem;
	}

	.auth-copy {
		margin: 0;
		color: var(--text-strong);
		font-weight: 600;
		font-size: 0.92rem;
	}

	.auth-error {
		display: grid;
		gap: 0.35rem;
	}

	.auth-error-copy {
		margin: 0;
		font-size: 0.84rem;
		color: var(--color-danger);
	}

	.page-shell {
		padding-bottom: 5.5rem;
	}

	@media (min-width: 720px) {
		.app-shell {
			padding-inline: 1.5rem;
		}

		.app-frame {
			margin-bottom: 1.25rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(*),
		:global(*::before),
		:global(*::after) {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
			scroll-behavior: auto !important;
		}
	}
</style>
