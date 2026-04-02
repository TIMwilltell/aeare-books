import Resend from '@auth/core/providers/resend';
import { convexAuth } from '@convex-dev/auth/server';

function generateLowercaseVerificationCode(): string {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		Resend({
			generateVerificationToken: async () => generateLowercaseVerificationCode(),
		}),
	],
});
