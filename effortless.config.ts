import { defineConfig } from "effortless-aws";

export default defineConfig({
  name: "tg-bot-docs",
  region: "eu-central-1",
  handlers: ["docs/aws-resources.ts"],
});
