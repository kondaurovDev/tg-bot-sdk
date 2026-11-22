import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // One step can wait out a rate limit Telegram asks for
    testTimeout: 120_000,
    hookTimeout: 120_000
  }
})
