import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import alpine from "@astrojs/alpinejs";
import tailwindcss from "@tailwindcss/vite";
import { rename, unlink } from "node:fs/promises";

export default defineConfig({
  site: "https://tg-bot-sdk.website",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap(),
    {
      name: "flatten-sitemap",
      hooks: {
        "astro:build:done": async ({ dir }) => {
          await unlink(new URL("sitemap-index.xml", dir));
          await rename(new URL("sitemap-0.xml", dir), new URL("sitemap.xml", dir));
        },
      },
    },
    alpine({ entrypoint: "/src/alpine-entrypoint" }),
    starlight({
      title: "Telegram Bot SDK",
      logo: {
        src: "./src/assets/logo.svg",
        alt: "Telegram Bot SDK",
      },
      social: {
        github: "https://github.com/kondaurovDev/tg-bot-sdk",
      },
      components: {
        SocialIcons: "./src/components/SocialIcons.astro",
        PageTitle: "./src/components/PageTitle.astro",
      },
      head: [
        {
          tag: "script",
          attrs: {
            async: true,
            src: "https://www.googletagmanager.com/gtag/js?id=G-1Y8J143871",
          },
        },
        {
          tag: "script",
          content: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-1Y8J143871');`,
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "https://tg-bot-sdk.website/og-banner.png",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:type",
            content: "website",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:site_name",
            content: "Telegram Bot SDK",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:card",
            content: "summary_large_image",
          },
        },
      ],
      favicon: "/favicon.svg",
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "getting-started/introduction" },
            { label: "Quick Start", slug: "getting-started/quick-start" },
          ],
        },
        {
          label: "Guides",
          items: [
            { label: "How to Use Client", slug: "client/usage" },
            { label: "How to Write Bots", slug: "bot-runner/writing-bots" },
            { label: "How to Run Bots", slug: "bot-runner/running-bots" },
            { label: "Examples", slug: "bot-runner/examples" },
          ],
        },
        {
          label: "Resources",
          items: [
            {
              label: "API Reference",
              items: [
                { label: "Methods", slug: "api" },
                { label: "Types", slug: "api/types" },
              ],
            },
            { label: "Bot API Types", slug: "api-types/bot-api" },
            { label: "Mini App Types", slug: "api-types/webapp" },
            { label: "Code Generator", slug: "api-types/how-it-works" },
            { label: "FAQ", slug: "faq" },
          ],
        },
      ],
    }),
  ],
});
