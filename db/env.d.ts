declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    FILES: R2Bucket;
    STUDIO_SETUP_CODE?: string;
    AUTH_PROVIDER?: 'openai-sites' | 'cloudflare-access';
    CF_ACCESS_TEAM_DOMAIN?: string;
    CF_ACCESS_AUD?: string;
    CF_ACCESS_LOGOUT_URL?: string;
  }
}
