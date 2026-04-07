import { sveltekit } from '@sveltejs/kit/vite';
import fs from 'node:fs';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const useHttps = process.env.DEV_HTTPS === 'true';
const devServerPort = Number(process.env.DEV_SERVER_PORT ?? '4173');
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
		key: httpsKeyPath,
		cert: httpsCertPath
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
