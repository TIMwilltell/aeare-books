import { browser } from '$app/environment';
import { ConvexClient } from 'convex/browser';
import { writable } from 'svelte/store';
import { api } from '../../convex/_generated/api';

type AuthStatus = 'loading' | 'signed-out' | 'signed-in' | 'error';

type UserProfile = {
	name?: string;
	email?: string;
};

type StoredTokens = {
	token: string;
	refreshToken: string;
};

type SignInResult = {
	tokens?: StoredTokens | null;
	redirect?: string;
};

type FetchTokenArgs = {
	forceRefreshToken?: boolean;
};

const JWT_STORAGE_KEY = '__convexAuthJWT';
const REFRESH_TOKEN_STORAGE_KEY = '__convexAuthRefreshToken';

export type AuthState = {
	status: AuthStatus;
	user: UserProfile | null;
	error: string | null;
};

export const authState = writable<AuthState>({
	status: 'loading',
	user: null,
	error: null,
});

let convexClient: ConvexClient | null = null;

function getConvexClient(): ConvexClient {
	if (!convexClient) {
		convexClient = new ConvexClient(import.meta.env.VITE_CONVEX_URL ?? 'https://jovial-wildcat-461.convex.cloud');
		convexClient.setAuth(fetchAccessToken);
	}

	return convexClient;
}

function readStoredTokens(): StoredTokens | null {
	if (!browser) {
		return null;
	}

	const token = window.localStorage.getItem(JWT_STORAGE_KEY);
	const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
	if (!token || !refreshToken) {
		return null;
	}

	return { token, refreshToken };
}

function storeTokens(tokens: StoredTokens | null) {
	if (!browser) {
		return;
	}

	if (!tokens) {
		window.localStorage.removeItem(JWT_STORAGE_KEY);
		window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
		return;
	}

	window.localStorage.setItem(JWT_STORAGE_KEY, tokens.token);
	window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
}

function normalizeSignInResult(result: unknown): SignInResult {
	if (!result || typeof result !== 'object') {
		return {};
	}

	const raw = result as { tokens?: unknown; redirect?: unknown };
	const redirect = typeof raw.redirect === 'string' ? raw.redirect : undefined;

	if (!raw.tokens || typeof raw.tokens !== 'object') {
		return { redirect };
	}

	const tokenCandidate = raw.tokens as { token?: unknown; refreshToken?: unknown };
	if (typeof tokenCandidate.token !== 'string' || typeof tokenCandidate.refreshToken !== 'string') {
		return { redirect };
	}

	return {
		redirect,
		tokens: {
			token: tokenCandidate.token,
			refreshToken: tokenCandidate.refreshToken,
		},
	};
}

async function runSignInAction(args: Record<string, unknown>): Promise<SignInResult> {
	const client = getConvexClient();
	const result = await client.action(api.auth.signIn, args as never);
	return normalizeSignInResult(result);
}

async function exchangeCodeFromUrl() {
	if (!browser) {
		return;
	}

	const url = new URL(window.location.href);
	const code = url.searchParams.get('code');
	if (!code) {
		return;
	}

	const result = await runSignInAction({ params: { code } });
	if (result.tokens) {
		storeTokens(result.tokens);
	}

	url.searchParams.delete('code');
	window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

async function loadSignedInUser(): Promise<UserProfile | null> {
	const client = getConvexClient();
	const user = await client.query(api.users.getCurrentUser, {});
	if (!user) {
		return null;
	}

	return {
		name: user.name ?? undefined,
		email: user.email ?? undefined,
	};
}

export async function initAuthSession() {
	if (!browser) {
		return;
	}

	authState.set({ status: 'loading', user: null, error: null });

	try {
		await exchangeCodeFromUrl();

		const existingTokens = readStoredTokens();
		if (!existingTokens) {
			authState.set({ status: 'signed-out', user: null, error: null });
			return;
		}

		const user = await loadSignedInUser();
		if (!user) {
			storeTokens(null);
			authState.set({ status: 'signed-out', user: null, error: null });
			return;
		}

		authState.set({ status: 'signed-in', user, error: null });
	} catch (error) {
		authState.set({
			status: 'error',
			user: null,
			error: error instanceof Error ? error.message : 'Auth session initialization failed.',
		});
	}
}

export async function signIn() {
	if (!browser) {
		return;
	}

	const email = window.prompt('Enter your email for a magic sign-in link:')?.trim();
	if (!email) {
		return;
	}

	const result = await runSignInAction({
		provider: 'resend',
		params: {
			email,
			redirectTo: window.location.pathname,
		},
	});

	if (result.tokens) {
		storeTokens(result.tokens);
		await initAuthSession();
	}
}

export async function signOut() {
	try {
		const client = getConvexClient();
		await client.action(api.auth.signOut, {});
	} finally {
		storeTokens(null);
		authState.set({ status: 'signed-out', user: null, error: null });
	}
}

export async function fetchAccessToken(args: FetchTokenArgs = {}): Promise<string | null> {
	if (!browser) {
		return null;
	}

	const existingTokens = readStoredTokens();
	if (!existingTokens) {
		return null;
	}

	if (!args.forceRefreshToken) {
		return existingTokens.token;
	}

	try {
		const result = await runSignInAction({ refreshToken: existingTokens.refreshToken });
		if (!result.tokens) {
			storeTokens(null);
			return null;
		}

		storeTokens(result.tokens);
		return result.tokens.token;
	} catch {
		storeTokens(null);
		return null;
	}
}
