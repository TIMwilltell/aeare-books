import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { json, type RequestHandler } from '@sveltejs/kit';
import { getServerConvexUrl } from '$lib/convex/serverUrl';
import { ConvexHttpClient } from 'convex/browser';
import { internal } from '../../../../convex/_generated/api';
import { z } from 'zod';

const EmailQuerySchema = z.object({
	email: z.string().trim().min(1, 'Missing email query parameter.').email('Invalid email query parameter.'),
});

type InternalConvexHttpClient = ConvexHttpClient & {
	setAdminAuth(token: string): void;
	query(functionReference: typeof internal.devInbox.getLatestMagicLink, args: { email: string }): Promise<unknown>;
	mutation(functionReference: typeof internal.devInbox.clearMagicLinks, args: { email: string }): Promise<unknown>;
};

function getClient() {
	const client = new ConvexHttpClient(getServerConvexUrl()) as InternalConvexHttpClient;
	if (!env.CONVEX_DEPLOY_KEY) {
		throw new Error('CONVEX_DEPLOY_KEY is required to access the local auth inbox.');
	}
	client.setAdminAuth(env.CONVEX_DEPLOY_KEY);
	return client;
}

function assertLocalTestRouteEnabled(): Response | null {
	if (!dev) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	return null;
}

function parseEmail(url: URL) {
	return EmailQuerySchema.safeParse({ email: url.searchParams.get('email')?.trim() });
}

export const GET: RequestHandler = async ({ url }) => {
	const notFoundResponse = assertLocalTestRouteEnabled();
	if (notFoundResponse) {
		return notFoundResponse;
	}

	const parsedEmail = parseEmail(url);
	if (!parsedEmail.success) {
		return json({ error: parsedEmail.error.issues[0]?.message ?? 'Invalid email query parameter.' }, { status: 400 });
	}

	try {
		const latest = await getClient().query(internal.devInbox.getLatestMagicLink, { email: parsedEmail.data.email });
		return json({ enabled: true, latest });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Local auth inbox unavailable.';
		return json({ enabled: false, error: message }, { status: 412 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	const notFoundResponse = assertLocalTestRouteEnabled();
	if (notFoundResponse) {
		return notFoundResponse;
	}

	const parsedEmail = parseEmail(url);
	if (!parsedEmail.success) {
		return json({ error: parsedEmail.error.issues[0]?.message ?? 'Invalid email query parameter.' }, { status: 400 });
	}

	try {
		await getClient().mutation(internal.devInbox.clearMagicLinks, { email: parsedEmail.data.email });
		return new Response(null, { status: 204 });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Local auth inbox unavailable.';
		return json({ enabled: false, error: message }, { status: 412 });
	}
};
