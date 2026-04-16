import { defineStaticSite } from "effortless-aws";

export const docsCDN = defineStaticSite({
  dir: "docs/dist",
  build: "pnpm run build",
  domain: "tg-bot-sdk.website",
  seo: {
    sitemap: 'sitemap.xml',
    googleIndexing: '~/google-index-seo.json'
  }
}).build();
