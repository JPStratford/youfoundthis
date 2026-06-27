/// <reference types="astro/client" />

type ENV = {
  DB: D1Database;
  PHOTOS: R2Bucket;
};

declare module 'cloudflare:workers' {
  interface Env extends ENV {}
}