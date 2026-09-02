import { runtimeString } from '../../runtime-config';
import { verifyAccessJwtAssertion } from '../access-jwt';
import type { IdentityProvider } from '../types';

const ACCESS_ASSERTION_HEADER = 'cf-access-jwt-assertion';

function requiredConfig(name: string): string {
  const value = runtimeString(name).trim();
  if (!value) {
    throw new Error(`Missing required runtime configuration: ${name}`);
  }
  return value;
}

async function getCloudflareAccessIdentity(requestHeaders: Headers) {
  const assertion = requestHeaders.get(ACCESS_ASSERTION_HEADER);
  if (!assertion) return null;

  try {
    return await verifyAccessJwtAssertion(assertion, {
      teamDomain: requiredConfig('CF_ACCESS_TEAM_DOMAIN'),
      audience: requiredConfig('CF_ACCESS_AUD'),
    });
  } catch {
    throw new Response('Invalid Cloudflare Access identity', { status: 401 });
  }
}

export const cloudflareAccessProvider: IdentityProvider = {
  name: 'cloudflare-access',
  getIdentity: getCloudflareAccessIdentity,
  signInPath: () => null,
  signOutPath: (returnTo) => runtimeString('CF_ACCESS_LOGOUT_URL') || returnTo,
};
