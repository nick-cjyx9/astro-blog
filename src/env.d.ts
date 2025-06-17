// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}

interface ImportMetaEnv {
  readonly GITHUB_CLIENT_ID: string
  readonly GITHUB_CLIENT_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
