/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
    }
  }
}

export { }