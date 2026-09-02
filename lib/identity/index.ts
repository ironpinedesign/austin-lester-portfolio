import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { runtimeString } from '../runtime-config';
import { cloudflareAccessProvider } from './providers/cloudflare-access';
import { openAiSitesProvider } from './providers/openai-sites';
import type { AppIdentity, IdentityProvider, IdentityProviderName } from './types';

const providers: Record<IdentityProviderName, IdentityProvider> = {
  'openai-sites': openAiSitesProvider,
  'cloudflare-access': cloudflareAccessProvider,
};

export function activeIdentityProvider(): IdentityProviderName {
  const configured = runtimeString('AUTH_PROVIDER', 'openai-sites').trim();
  if (configured === 'cloudflare-access') return 'cloudflare-access';
  return 'openai-sites';
}

function currentProvider(): IdentityProvider {
  return providers[activeIdentityProvider()];
}

export async function getRequestIdentity(): Promise<AppIdentity | null> {
  const requestHeaders = await headers();
  return currentProvider().getIdentity(requestHeaders);
}

export async function requireRequestIdentity(returnTo: string): Promise<AppIdentity> {
  const identity = await getRequestIdentity();
  if (identity) return identity;

  const signInPath = currentProvider().signInPath?.(returnTo);
  if (signInPath) redirect(signInPath);

  throw new Response('Sign in required', { status: 401 });
}

export function authSignOutPath(returnTo = '/'): string | null {
  return currentProvider().signOutPath?.(returnTo) ?? null;
}
