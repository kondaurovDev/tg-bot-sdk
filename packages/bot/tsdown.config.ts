import { defineConfig } from "tsdown"

export default defineConfig({
  entry: ["src/index.ts", "src/api.ts", "src/client.ts"],
  format: ["esm", "cjs"],
  dts: true,
  // Runs anywhere `fetch` does: no Node built-ins, no syntax lowering
  platform: "neutral",
  target: false,
  // `.js` for ESM (the package is "type": "module"), `.cjs`, `.d.ts`
  fixedExtension: false
})
