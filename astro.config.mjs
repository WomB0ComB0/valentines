// @ts-check
import { defineConfig } from 'astro/config';
import vercel from "@astrojs/vercel";
// import cloudflare from '@astrojs/cloudflare';
// import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    ssr: {
      noExternal: ['dotenv', 'zod'],
    },
  },
});
