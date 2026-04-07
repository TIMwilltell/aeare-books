import { defineConfig, devices } from '@playwright/test';

const devServerPort = Number(process.env.DEV_SERVER_PORT ?? '4173');
const devServerBaseUrl = `http://127.0.0.1:${devServerPort}`;

export default defineConfig({
	testDir: './tests/e2e',
	timeout: 30_000,
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	use: {
		baseURL: devServerBaseUrl,
		trace: 'on-first-retry'
	},
	webServer: {
		command: `bun run dev --host 127.0.0.1 --port ${devServerPort}`,
		url: devServerBaseUrl,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] }
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] }
		}
	]
});
