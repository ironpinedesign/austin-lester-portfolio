declare namespace Cloudflare {
  interface Env {
    FILES: R2Bucket;
    DB: D1Database;
    STUDIO_SETUP_CODE?: string;
    AUTH_PROVIDER?: 'openai-sites' | 'cloudflare-access';
    CF_ACCESS_TEAM_DOMAIN?: string;
    CF_ACCESS_AUD?: string;
    CF_ACCESS_LOGOUT_URL?: string;
  }
}
