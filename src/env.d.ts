type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface ImportMetaEnv {
  readonly GITHUB_CLIENT_ID: string;
  readonly GITHUB_CLIENT_SECRET: string;
  readonly GITHUB_REPO: string;
  readonly SITE_URL: string;
  readonly REPO_BRANCH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
