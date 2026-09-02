export type IdentityProviderName = 'openai-sites' | 'cloudflare-access';

export type AppIdentity = {
  userId: string;
  email: string;
  displayName: string;
  fullName: string | null;
  provider: IdentityProviderName;
};

export type IdentityProvider = {
  name: IdentityProviderName;
  getIdentity(requestHeaders: Headers): Promise<AppIdentity | null>;
  signInPath?(returnTo: string): string | null;
  signOutPath?(returnTo: string): string | null;
};
