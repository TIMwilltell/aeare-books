import { sveltekit } from '@sveltejs/kit/vite';
import fs from 'node:fs';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { z } from 'zod';

const DevServerEnvSchema = z.object({
	DEV_HTTPS: z.enum(['true', 'false']).optional(),
	DEV_SERVER_PORT: z.coerce.number().int().positive().default(4173)
});

const devServerEnv = DevServerEnvSchema.parse(process.env);
const useHttps = devServerEnv.DEV_HTTPS === 'true';
const devServerPort = devServerEnv.DEV_SERVER_PORT;
const httpsKeyPath = './ssl/localhost.key';
const httpsCertPath = './ssl/localhost.crt';

function resolveHttpsConfig() {
	if (!useHttps) {
		return undefined;
	}

	if (!fs.existsSync(httpsKeyPath) || !fs.existsSync(httpsCertPath)) {
		console.warn(
			`DEV_HTTPS=true but ${httpsKeyPath} or ${httpsCertPath} is missing. Falling back to HTTP dev server.`
		);
		return undefined;
	}

	return {
		key: fs.readFileSync(httpsKeyPath),
		cert: fs.readFileSync(httpsCertPath)
	};
}

export default defineConfig({
	ssr: {
		external: ['quagga']
	},
	server: {
		https: resolveHttpsConfig(),
		host: '0.0.0.0',
		port: devServerPort
	},
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			manifest: false,
			includeAssets: ['icon-192.png', 'icon-512.png', 'manifest.webmanifest'],
			workbox: {
				globPatterns: ['**/*']
			},
			devOptions: {
				enabled: false,
				navigateFallback: '/'
			}
		})
	]
});
