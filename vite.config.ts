import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	ssr: {
		external: ['quagga', 'playwright', 'playwright-core']
	},
	server: {
		https: {
			key: './ssl/localhost.key',
			cert: './ssl/localhost.crt'
		},
		host: '0.0.0.0',
		port: 5173
	},
	plugins: [
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			manifest: {
				name: 'AeAre Books',
				short_name: 'AeAre',
				description: 'Track your children\'s AR reading progress',
				theme_color: '#4A90D9',
				icons: [
					{
						src: '/icon-192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				],
				start_url: '/',
				display: 'standalone',
				orientation: 'portrait',
				scope: '/'
			},
			workbox: {
				globPatterns: ['client/**/*']
			},
			devOptions: {
				enabled: false,
				navigateFallback: '/'
			}
		})
	]
});
