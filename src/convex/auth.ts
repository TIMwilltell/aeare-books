import { convexAuth, type EmailConfig, type GenericActionCtxWithAuthConfig } from '@convex-dev/auth/server';
import { internal } from './_generated/api';

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
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="#346df1"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: #fff; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid #346df1; display: inline-block; font-weight: bold;">Sign in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: #444;">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`;
}

function renderMagicLinkText(url: string, host: string) {
	return `Sign in to ${host}\n${url}\n\n`;
}

function isLocalAuthEmailMode() {
	return process.env.AEARE_AUTH_EMAIL_MODE === 'local';
}

function getAuthEmailFrom() {
	return process.env.AUTH_EMAIL_FROM ?? 'AeAre Books <auth@aeare.local>';
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

		const resendKey = process.env.AUTH_RESEND_KEY;
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
			throw new Error(`Resend error: ${JSON.stringify(await response.json())}`);
		}
	}) as EmailConfig['sendVerificationRequest'];

	return {
		id: 'resend',
		type: 'email',
		name: 'Resend',
		from: getAuthEmailFrom(),
		maxAge: 24 * 60 * 60,
		apiKey: process.env.AUTH_RESEND_KEY,
		generateVerificationToken: async () => generateLowercaseVerificationCode(),
		options: {},
		sendVerificationRequest,
	};
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [getMagicLinkProvider()],
});
