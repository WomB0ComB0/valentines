/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GROQ_API_KEY: string;
    }
  }
}

export {};
