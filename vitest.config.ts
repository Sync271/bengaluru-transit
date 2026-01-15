import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		testTimeout: 30000, // 30 seconds default timeout for integration tests
		// Run tests sequentially to prevent rate limiting
		pool: "forks",
		poolOptions: {
			forks: {
				singleFork: true,
			},
		},
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"dist/",
				"tests/",
				"**/*.test.ts",
				"**/*.spec.ts",
			],
		},
	},
});
