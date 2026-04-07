import { dev } from '$app/environment';
import { json, type RequestHandler } from '@sveltejs/kit';
import { getServerConvexUrl } from '$lib/convex/serverUrl';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

function getClient() {
	return new ConvexHttpClient(getServerConvexUrl());
}

function assertLocalTestRouteEnabled() {
	if (!dev) {
		throw new Error('Not found');
	}
}

export const GET: RequestHandler = async ({ url }) => {
	assertLocalTestRouteEnabled();

	const email = url.searchParams.get('email')?.trim();
	if (!email) {
		return json({ error: 'Missing email query parameter.' }, { status: 400 });
	}

	try {
		const latest = await getClient().query(api.devInbox.getLatestMagicLink, { email });
		return json({ enabled: true, latest });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Local auth inbox unavailable.';
		return json({ enabled: false, error: message }, { status: 412 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	assertLocalTestRouteEnabled();

	const email = url.searchParams.get('email')?.trim() || undefined;

	try {
		await getClient().mutation(api.devInbox.clearMagicLinks, { email });
		return new Response(null, { status: 204 });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Local auth inbox unavailable.';
		return json({ enabled: false, error: message }, { status: 412 });
	}
};
