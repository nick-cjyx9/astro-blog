// Augment Cloudflare Worker Env bindings for TypeScript
// Keep this in source control; do not edit the generated worker-configuration.d.ts

export {};

declare global {
  namespace Cloudflare {
    interface Env {
      RESEND_API_KEY: string;
      RESEND_EMAIL_FROM: string;
      RESEND_EMAIL_TO: string;
    }
  }
}
