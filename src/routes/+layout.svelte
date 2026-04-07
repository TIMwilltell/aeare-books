<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import StatusBanner from '$lib/components/StatusBanner.svelte';
	import {
		authState,
		clearProtectedRouteIntent,
		consumeProtectedRouteIntent,
		describeProtectedRouteIntent,
		fetchAccessToken,
		initAuthSession,
		isProtectedPath,
		peekProtectedRouteIntent,
		rememberProtectedRouteIntent,
		signIn,
		signOut
	} from '$lib/auth/auth0';
	import { getBrowserConvexClient } from '$lib/convex/client';
	import { setConvexClientContext } from 'convex-svelte';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	const { children } = $props();
	let authActionPending = $state(false);
	let authActionError = $state<string | null>(null);
	let redirectingProtectedPath = $state<string | null>(null);
	let protectedRoute = $derived(isProtectedPath(page.url.pathname));
	let pendingProtectedRouteIntent = $state<string | null>(null);
	let restoringProtectedPath = $state<string | null>(null);
	let protectedRouteIntentLabel = $derived(describeProtectedRouteIntent(pendingProtectedRouteIntent));

	const convexClient = getBrowserConvexClient();
	convexClient.setAuth(fetchAccessToken);
	setConvexClientContext(convexClient);

	onMount(() => {
		void initAuthSession();
		syncProtectedRouteRedirect();
		void syncProtectedRouteIntentRestore();

		const unsubscribe = authState.subscribe(() => {
			syncProtectedRouteRedirect();
			void syncProtectedRouteIntentRestore();
		});

		return unsubscribe;
	});

	afterNavigate(() => {
		syncProtectedRouteRedirect();
		void syncProtectedRouteIntentRestore();
	});

	function syncProtectedRouteRedirect(pathname = page.url.pathname) {
		pendingProtectedRouteIntent = peekProtectedRouteIntent();

		if (get(authState).status === 'signed-in' && pendingProtectedRouteIntent === `${page.url.pathname}${page.url.search}${page.url.hash}`) {
			clearProtectedRouteIntent();
			pendingProtectedRouteIntent = null;
		}

		if (!isProtectedPath(pathname)) {
			redirectingProtectedPath = null;
			return;
		}

		if (get(authState).status !== 'signed-out') {
			redirectingProtectedPath = null;
			return;
		}

		if (redirectingProtectedPath === pathname) {
			return;
		}

		pendingProtectedRouteIntent = rememberProtectedRouteIntent(page.url.pathname, page.url.search, page.url.hash);
		redirectingProtectedPath = pathname;
		void goto('/', { replaceState: true });
	}

	async function syncProtectedRouteIntentRestore() {
		pendingProtectedRouteIntent = peekProtectedRouteIntent();

		if ($authState.status !== 'signed-in') {
			if ($authState.status !== 'loading') {
				restoringProtectedPath = null;
			}
			return;
		}

		const currentPath = `${page.url.pathname}${page.url.search}${page.url.hash}`;
		if (pendingProtectedRouteIntent === currentPath) {
			clearProtectedRouteIntent();
			pendingProtectedRouteIntent = null;
			restoringProtectedPath = null;
			return;
		}

		if (page.url.pathname !== '/' || restoringProtectedPath) {
			return;
		}

		const nextPath = consumeProtectedRouteIntent();
		pendingProtectedRouteIntent = peekProtectedRouteIntent();
		if (!nextPath) {
			return;
		}

		restoringProtectedPath = nextPath;

		try {
			await goto(nextPath, { replaceState: true });
		} finally {
			restoringProtectedPath = null;
		}
	}

	let showProtectedLoading = $derived(protectedRoute && $authState.status === 'loading');
	let showProtectedError = $derived(protectedRoute && $authState.status === 'error');
	let showProtectedRedirect = $derived(protectedRoute && redirectingProtectedPath === page.url.pathname);
	let showProtectedRestore = $derived(page.url.pathname === '/' && restoringProtectedPath !== null);

	async function handleSignIn() {
		authActionPending = true;
		authActionError = null;

		try {
			await signIn();
		} catch (error) {
			authActionError = error instanceof Error ? error.message : 'Sign-in failed. Please try again.';
		} finally {
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
		} finally {
			authActionPending = false;
		}
	}

	async function handleRetryAuth() {
		authActionPending = true;
		authActionError = null;

		try {
			await initAuthSession();
		} catch (error) {
			authActionError = error instanceof Error ? error.message : 'Retry failed. Please try again.';
		} finally {
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
				{#if protectedRouteIntentLabel}
					<p class="auth-intent-copy">Sign in and we will return you to {protectedRouteIntentLabel}.</p>
				{/if}
			{:else if $authState.status === 'signed-in'}
				<div class="auth-row">
					<p class="auth-copy">
						Signed in{#if $authState.user?.name} as <strong>{$authState.user.name}</strong>{/if}
					</p>
					<button class="ghost-button" type="button" onclick={handleSignOut} disabled={authActionPending}>
						{authActionPending ? 'Signing out…' : 'Sign out'}
					</button>
				</div>
				{#if showProtectedRestore && protectedRouteIntentLabel}
					<p class="auth-intent-copy">Returning you to {protectedRouteIntentLabel} now.</p>
				{/if}
			{:else}
				<div class="auth-error" role="alert">
					<p class="auth-copy">We could not finish authentication setup.</p>
					{#if $authState.error}
						<p class="auth-error-copy">{$authState.error}</p>
					{/if}
					<p class="auth-error-copy">Retry now, or sign out and sign in again.</p>
					<div class="auth-row auth-actions">
						<button class="primary-button" type="button" onclick={handleRetryAuth} disabled={authActionPending}>
							{authActionPending ? 'Retrying…' : 'Retry authentication'}
						</button>
						<button class="ghost-button" type="button" onclick={handleSignOut} disabled={authActionPending}>
							Sign out
						</button>
					</div>
				</div>
			{/if}

			{#if authActionError}
				<p class="auth-error-copy" role="alert">{authActionError}</p>
			{/if}
		</section>
	</header>

	<main id="main-content" class="page-shell">
		{#if showProtectedLoading}
			<section class="section-card route-guard-card" aria-live="polite">
				<p class="eyebrow">Protected route</p>
				<h1>Checking your session before we open this task.</h1>
				<p>Hold on while we confirm your library access.</p>
			</section>
		{:else if showProtectedRedirect}
			<section class="section-card route-guard-card" aria-live="polite">
				<p class="eyebrow">Sign-in required</p>
				<h1>This task is only available in a signed-in library.</h1>
				<p>Returning you to the home shelf now.</p>
			</section>
		{:else if showProtectedError}
			<section class="section-card route-guard-card" aria-live="polite">
				<p class="eyebrow">Protected route</p>
				<h1>We need to restore authentication before opening this page.</h1>
				<p>Use the auth controls above to retry or sign out, then try again.</p>
			</section>
		{:else if showProtectedRestore}
			<section class="section-card route-guard-card" aria-live="polite">
				<p class="eyebrow">Protected route</p>
				<h1>We restored your session and are reopening that task.</h1>
				<p>Hold on while we return you to the page you asked for.</p>
			</section>
		{:else}
			{@render children()}
		{/if}
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

	.auth-actions {
		justify-content: flex-start;
		flex-wrap: wrap;
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

	.auth-intent-copy {
		margin: 0;
		font-size: 0.84rem;
		color: var(--text-muted);
	}

	.page-shell {
		padding-bottom: 5.5rem;
	}

	.route-guard-card {
		display: grid;
		gap: 0.75rem;
		padding: 1.25rem;
		text-align: center;
	}

	.route-guard-card h1,
	.route-guard-card p {
		margin: 0;
	}

	.route-guard-card h1 {
		font-family: var(--font-serif);
		font-size: 1.7rem;
		color: var(--text-strong);
	}

	.route-guard-card p:last-child {
		line-height: 1.6;
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
