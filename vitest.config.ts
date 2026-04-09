import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: 'convex',
					include: ['src/convex/**/*.test.ts'],
					environment: 'edge-runtime'
				}
			}
		]
	}
});
