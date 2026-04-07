import { convexAuth, type EmailConfig, type GenericActionCtxWithAuthConfig } from '@convex-dev/auth/server';
import { internal } from './_generated/api';
import { convexEnv } from './lib/env';

function generateLowercaseVerificationCode(): string {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function renderMagicLinkHtml(url: string, host: string) {
	const escapedHost = host.replace(/\./g, '&#8203;.');
	return `
<body style="background: #f9f9f9;">
  <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: #fff; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center" style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">
	        Sign in to <strong>${escapedHost}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0 24px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">
	        Use the button below to sign in securely.
	      </td>
	    </tr>
	    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
	            <td align="center" style="border-radius: 5px;" bgcolor="#346df1"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: #fff; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid #346df1; display: inline-block; font-weight: bold;">Open sign-in link</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">
	        If you did not request this email, you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

function renderMagicLinkText(url: string, host: string) {
	return `Sign in to ${host}\nOpen this link to continue:\n${url}\n\nIf you did not request this email, you can safely ignore it.\n`;
}

function isLocalAuthEmailMode() {
	return convexEnv.AEARE_AUTH_EMAIL_MODE === 'local';
}

function getAuthEmailFrom() {
	return convexEnv.AUTH_EMAIL_FROM;
}

async function readResponseBody(response: Response): Promise<string | null> {
	const bodyText = (await response.text()).trim();
	if (!bodyText) {
		return null;
	}

	try {
		return JSON.stringify(JSON.parse(bodyText));
	} catch {
		return bodyText;
	}
}

function getMagicLinkProvider(): EmailConfig {
	const sendVerificationRequest = (async (
		params: Parameters<EmailConfig['sendVerificationRequest']>[0],
		ctx?: GenericActionCtxWithAuthConfig<any>
	) => {
		const { identifier, url, token, expires } = params;
		const host = new URL(url).host;
		const subject = `Sign in to ${host}`;
		const html = renderMagicLinkHtml(url, host);
		const text = renderMagicLinkText(url, host);

		if (isLocalAuthEmailMode()) {
			if (!ctx) {
				throw new Error('Local auth inbox requires Convex action context');
			}

			await ctx.runMutation(internal.devInbox.storeMagicLinkEmail, {
				email: identifier,
				url,
				token,
				subject,
				html,
				text,
				expiresAt: expires.getTime(),
			});
			return;
		}

		const resendKey = convexEnv.AUTH_RESEND_KEY;
		if (!resendKey) {
			throw new Error('AUTH_RESEND_KEY is not configured.');
		}

		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${resendKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: getAuthEmailFrom(),
				to: identifier,
				subject,
				html,
				text,
			}),
		});

		if (!response.ok) {
			const body = await readResponseBody(response);
			const statusDetails = `${response.status} ${response.statusText}`.trim();
			throw new Error(
				body ? `Resend error (${statusDetails}): ${body}` : `Resend error (${statusDetails}).`
			);
		}
	}) as EmailConfig['sendVerificationRequest'];

	return {
		id: 'resend',
		type: 'email',
		name: 'Resend',
		from: getAuthEmailFrom(),
		maxAge: 24 * 60 * 60,
		apiKey: convexEnv.AUTH_RESEND_KEY,
		generateVerificationToken: async () => generateLowercaseVerificationCode(),
		options: {},
		sendVerificationRequest,
	};
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [getMagicLinkProvider()],
});
