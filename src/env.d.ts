declare interface ImportMetaEnv {
  readonly GITHUB_CLIENT_ID: string
  readonly GITHUB_CLIENT_SECRET: string
  readonly GITHUB_REPO: string
  readonly SITE_URL: string
  readonly REPO_BRANCH: string
  readonly RESEND_API_KEY: string
  readonly RESEND_EMAIL_FROM: string
  readonly RESEND_EMAIL_TO: string
}

declare namespace App {
  interface Locals extends Runtime {}
}

type Runtime = import('@astrojs/cloudflare').Runtime<ImportMetaEnv>
