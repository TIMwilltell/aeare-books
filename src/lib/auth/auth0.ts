import { createAuth0Client, type Auth0Client, type User } from '@auth0/auth0-spa-js';
import { browser } from '$app/environment';
import { ConvexClient } from 'convex/browser';
import { writable } from 'svelte/store';
import { api } from '../../convex/_generated/api';

type AuthStatus = 'loading' | 'signed-out' | 'signed-in' | 'error';

type AuthConfig = {
	domain: string;
	clientId: string;
	audience: string;
	redirectUri: string;
};

export type AuthState = {
	status: AuthStatus;
	user: User | null;
	error: string | null;
};

export const authState = writable<AuthState>({
	status: 'loading',
	user: null,
	error: null,
});

let clientPromise: Promise<Auth0Client> | null = null;
let convexClient: ConvexClient | null = null;

function authConfig(): AuthConfig {
	const domain = import.meta.env.VITE_AUTH0_DOMAIN as string | undefined;
	const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined;
	const audience = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined;
	const redirectUri = (import.meta.env.VITE_AUTH0_REDIRECT_URI as string | undefined) ??
		(browser ? window.location.origin : undefined);

	if (!domain || !clientId || !audience || !redirectUri) {
		throw new Error(
			'Missing auth environment values. Expected VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE, and VITE_AUTH0_REDIRECT_URI (or a browser origin).'
		);
	}

	return {
		domain,
		clientId,
		audience,
		redirectUri,
	};
}

async function getClient(): Promise<Auth0Client> {
	const config = authConfig();

	if (!clientPromise) {
		clientPromise = createAuth0Client({
			domain: config.domain,
			clientId: config.clientId,
			cacheLocation: 'localstorage',
			useRefreshTokens: true,
			authorizationParams: {
				audience: config.audience,
				redirect_uri: config.redirectUri,
			},
		});
	}

	if (!clientPromise) {
		throw new Error('Auth0 client failed to initialize.');
	}

	return clientPromise;
}

function getConvexClient(): ConvexClient {
	if (!convexClient) {
		convexClient = new ConvexClient(
			import.meta.env.VITE_CONVEX_URL ?? 'https://jovial-wildcat-461.convex.cloud'
		);
		convexClient.setAuth(fetchAccessToken);
	}

	return convexClient;
}

async function bootstrapUserProfile() {
	const client = getConvexClient();

	try {
		await client.mutation(api.users.ensureCurrentUser, {});
	} catch (error) {
		const detail = error instanceof Error ? error.message : 'Unknown error';
		throw new Error(
			`Signed in, but we could not finish account setup. Please retry. If this keeps happening, verify Auth0 audience/application settings. (${detail})`
		);
	}
}

export async function initAuthSession() {
	if (!browser) {
		return;
	}

	authState.set({ status: 'loading', user: null, error: null });

	try {
		const client = await getClient();

		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.has('code') && searchParams.has('state')) {
			await client.handleRedirectCallback();
			window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
		}

		const isAuthenticated = await client.isAuthenticated();
		if (!isAuthenticated) {
			authState.set({ status: 'signed-out', user: null, error: null });
			return;
		}

		const user = await client.getUser();
		authState.set({ status: 'signed-in', user: user ?? null, error: null });
		await bootstrapUserProfile();
	} catch (error) {
		authState.set({
			status: 'error',
			user: null,
			error: error instanceof Error ? error.message : 'Auth session initialization failed.',
		});
	}
}

export async function signIn() {
	const client = await getClient();
	const config = authConfig();

	await client.loginWithRedirect({
		authorizationParams: {
			audience: config.audience,
			redirect_uri: config.redirectUri,
		},
	});
}

export async function signOut() {
	const client = await getClient();
	const config = authConfig();

	authState.set({ status: 'signed-out', user: null, error: null });

	await client.logout({
		logoutParams: {
			returnTo: config.redirectUri,
		},
	});
}

export async function fetchAccessToken(): Promise<string | null> {
	if (!browser) {
		return null;
	}

	try {
		const client = await getClient();
		const isAuthenticated = await client.isAuthenticated();
		if (!isAuthenticated) {
			return null;
		}

		return await client.getTokenSilently();
	} catch {
		return null;
	}
}
