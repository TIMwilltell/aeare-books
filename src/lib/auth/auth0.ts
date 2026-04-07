import { browser } from '$app/environment';
import { replaceState } from '$app/navigation';
import { getBrowserConvexClient } from '$lib/convex/client';
import { getPublicConvexUrl } from '$lib/convex/url';
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

const PROTECTED_ROUTE_PATTERNS = [/^\/scan$/, /^\/book\/new$/, /^\/book\/[^/]+$/];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const JWT_STORAGE_KEY = '__convexAuthJWT';
const REFRESH_TOKEN_STORAGE_KEY = '__convexAuthRefreshToken';
const PROTECTED_ROUTE_INTENT_STORAGE_KEY = '__aeareProtectedRouteIntent';

export function isProtectedPath(pathname: string): boolean {
	return PROTECTED_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

function buildProtectedRouteIntent(pathname: string, search = '', hash = ''): string | null {
	if (!isProtectedPath(pathname)) {
		return null;
	}

	return `${pathname}${search}${hash}`;
}

export function peekProtectedRouteIntent(): string | null {
	if (!browser) {
		return null;
	}

	const storedIntent = window.localStorage.getItem(PROTECTED_ROUTE_INTENT_STORAGE_KEY);
	if (!storedIntent) {
		return null;
	}

	try {
		const url = new URL(storedIntent, window.location.origin);
		return buildProtectedRouteIntent(url.pathname, url.search, url.hash);
	} catch {
		window.localStorage.removeItem(PROTECTED_ROUTE_INTENT_STORAGE_KEY);
		return null;
	}
}

export function rememberProtectedRouteIntent(pathname: string, search = '', hash = ''): string | null {
	if (!browser) {
		return null;
	}

	const intent = buildProtectedRouteIntent(pathname, search, hash);
	if (!intent) {
		return null;
	}

	window.localStorage.setItem(PROTECTED_ROUTE_INTENT_STORAGE_KEY, intent);
	return intent;
}

export function clearProtectedRouteIntent() {
	if (!browser) {
		return;
	}

	window.localStorage.removeItem(PROTECTED_ROUTE_INTENT_STORAGE_KEY);
}

export function consumeProtectedRouteIntent(): string | null {
	const intent = peekProtectedRouteIntent();
	if (intent) {
		clearProtectedRouteIntent();
	}

	return intent;
}

export function describeProtectedRouteIntent(intent: string | null): string | null {
	if (!intent) {
		return null;
	}

	const pathname = intent.split(/[?#]/, 1)[0] ?? intent;
	if (pathname === '/scan') {
		return 'the scanner';
	}

	if (pathname === '/book/new') {
		return 'the add-book form';
	}

	if (isProtectedPath(pathname)) {
		return 'that book';
	}

	return null;
}

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
let authActionQueue: Promise<unknown> = Promise.resolve();

function getConvexClient(): ConvexClient {
	if (!convexClient) {
		convexClient = getBrowserConvexClient();
		convexClient.setAuth(fetchAccessToken);
	}

	return convexClient;
}

function runSerializedAuthAction<T>(operation: () => Promise<T>): Promise<T> {
	const run = authActionQueue.catch(() => undefined).then(operation);
	authActionQueue = run.then(
		() => undefined,
		() => undefined
	);
	return run;
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
		convexClient?.setAuth(fetchAccessToken);
		return;
	}

	window.localStorage.setItem(JWT_STORAGE_KEY, tokens.token);
	window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
	convexClient?.setAuth(fetchAccessToken);
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

function getSignInErrorMessage(error: unknown): string {
	const rawMessage = error instanceof Error ? error.message : 'Sign-in request failed.';

	if (rawMessage.includes('Invalid `to` field')) {
		return 'That email address format looks invalid. Please enter a valid email and try again.';
	}

	if (rawMessage.includes('only send testing emails to your own email address')) {
		return 'Email sending is currently in Resend testing mode. Use the account owner email, or verify a sending domain in Resend first.';
	}

	return rawMessage;
}

async function runSignInAction(args: Record<string, unknown>): Promise<SignInResult> {
	const client = getConvexClient();
	const result = await runSerializedAuthAction(() => client.action(api.auth.signIn, args as never));
	return normalizeSignInResult(result);
}

function extractVerificationCode(rawCode: string): string | null {
	const trimmed = rawCode.trim();
	if (/^[0-9a-z]{32}$/i.test(trimmed)) {
		return trimmed;
	}

	try {
		const decoded = decodeURIComponent(trimmed);
		const match = decoded.match(/[0-9a-z]{32}/i);
		return match?.[0] ?? null;
	} catch {
		const match = trimmed.match(/[0-9a-z]{32}/i);
		return match?.[0] ?? null;
	}
}

async function exchangeCodeFromUrl() {
	if (!browser) {
		return;
	}

	const url = new URL(window.location.href);
	const rawCode = url.searchParams.get('code');
	if (!rawCode) {
		return;
	}

	const code = extractVerificationCode(rawCode);
	if (!code) {
		throw new Error('Magic-link code format was invalid. Please request a fresh sign-in link.');
	}

	const result = await runSignInAction({ params: { code } });
	if (!result.tokens) {
		throw new Error('Magic-link code was invalid or expired. Please request a new sign-in link.');
	}

	storeTokens(result.tokens);

	url.searchParams.delete('code');
	replaceState(`${url.pathname}${url.search}${url.hash}`, {});
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

	if (!EMAIL_PATTERN.test(email)) {
		authState.set({
			status: 'error',
			user: null,
			error: 'Please enter a valid email address to receive a magic sign-in link.',
		});
		return;
	}

	try {
		const result = await runSignInAction({
			provider: 'resend',
			params: {
				email,
				redirectTo: peekProtectedRouteIntent() ?? window.location.pathname,
			},
		});

		if (result.tokens) {
			storeTokens(result.tokens);
			await initAuthSession();
			return;
		}

		authState.set({ status: 'signed-out', user: null, error: null });
	} catch (error) {
		authState.set({
			status: 'error',
			user: null,
			error: getSignInErrorMessage(error),
		});
	}
}

export async function signOut() {
	try {
		const client = getConvexClient();
		await runSerializedAuthAction(() => client.action(api.auth.signOut, {}));
	} finally {
		clearProtectedRouteIntent();
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
