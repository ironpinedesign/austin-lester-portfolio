import type { AppIdentity } from './types';

type JwtHeader = { alg?: string; kid?: string; typ?: string };
type JwtPayload = {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  email?: string;
  name?: string;
  [key: string]: unknown;
};

type VerifyOptions = {
  teamDomain: string;
  audience: string;
  fetchImpl?: typeof fetch;
  nowSeconds?: number;
  clockSkewSeconds?: number;
};

type JwkSet = { keys?: JsonWebKey[] };
type AccessJwk = JsonWebKey & { kid?: string };

type VerifyAlgorithm =
  | { importParams: RsaHashedImportParams; verifyParams: RsaPssParams | AlgorithmIdentifier }
  | { importParams: EcKeyImportParams; verifyParams: EcdsaParams };

function normalizeBase64Url(value: string): string {
  const padLength = (4 - (value.length % 4)) % 4;
  return value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(padLength);
}

function decodeJson<T>(base64Url: string): T {
  const text = Buffer.from(normalizeBase64Url(base64Url), 'base64').toString('utf8');
  return JSON.parse(text) as T;
}

function toUint8(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

function parseToken(token: string): {
  header: JwtHeader;
  payload: JwtPayload;
  signedData: Uint8Array;
  signature: Uint8Array;
} {
  const parts = token.split('.');
  if (parts.length !== 3 || parts.some((p) => p.length === 0)) {
    throw new Error('Malformed Access JWT.');
  }

  const [headerPart, payloadPart, signaturePart] = parts;
  const header = decodeJson<JwtHeader>(headerPart);
  const payload = decodeJson<JwtPayload>(payloadPart);

  return {
    header,
    payload,
    signedData: toUint8(`${headerPart}.${payloadPart}`),
    signature: new Uint8Array(
      Buffer.from(normalizeBase64Url(signaturePart), 'base64'),
    ),
  };
}

function normalizeTeamDomain(input: string): string {
  const value = input.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!value) throw new Error('CF_ACCESS_TEAM_DOMAIN is required.');
  return value;
}

function expectedIssuer(teamDomain: string): string {
  return `https://${normalizeTeamDomain(teamDomain)}`;
}

function jwksUrl(teamDomain: string): string {
  return `${expectedIssuer(teamDomain)}/cdn-cgi/access/certs`;
}

function audienceMatches(aud: string | string[] | undefined, expected: string): boolean {
  if (typeof aud === 'string') return aud === expected;
  if (Array.isArray(aud)) return aud.includes(expected);
  return false;
}

function verifyTiming(payload: JwtPayload, nowSeconds: number, skewSeconds: number): void {
  if (!Number.isFinite(payload.exp)) throw new Error('Access JWT missing expiration.');
  if ((payload.exp as number) <= nowSeconds - skewSeconds) {
    throw new Error('Access JWT expired.');
  }

  if (Number.isFinite(payload.nbf) && (payload.nbf as number) > nowSeconds + skewSeconds) {
    throw new Error('Access JWT not yet valid.');
  }

  if (Number.isFinite(payload.iat) && (payload.iat as number) > nowSeconds + skewSeconds) {
    throw new Error('Access JWT issued in the future.');
  }
}

function verifyClaims(payload: JwtPayload, teamDomain: string, audience: string): void {
  if (payload.iss !== expectedIssuer(teamDomain)) {
    throw new Error('Access JWT issuer mismatch.');
  }

  if (!audienceMatches(payload.aud, audience)) {
    throw new Error('Access JWT audience mismatch.');
  }

  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('Access JWT missing subject claim.');
  }

  if (typeof payload.email !== 'string' || !payload.email) {
    throw new Error('Access JWT missing email claim.');
  }
}

function algorithmFor(header: JwtHeader): VerifyAlgorithm {
  if (header.alg === 'RS256') {
    return {
      importParams: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      verifyParams: { name: 'RSASSA-PKCS1-v1_5' },
    };
  }

  if (header.alg === 'ES256') {
    return {
      importParams: { name: 'ECDSA', namedCurve: 'P-256' },
      verifyParams: { name: 'ECDSA', hash: 'SHA-256' },
    };
  }

  throw new Error('Unsupported Access JWT algorithm.');
}

function isUsableJwk(jwk: JsonWebKey): boolean {
  return jwk.use === undefined || jwk.use === 'sig';
}

async function fetchJwks(teamDomain: string, fetchImpl: typeof fetch): Promise<AccessJwk[]> {
  const response = await fetchImpl(jwksUrl(teamDomain), { method: 'GET' });
  if (!response.ok) throw new Error(`Failed to load Access certs (${response.status}).`);

  const data = (await response.json()) as JwkSet;
  if (!Array.isArray(data.keys) || data.keys.length === 0) {
    throw new Error('Access cert set is empty.');
  }

  return data.keys.filter(isUsableJwk);
}

async function verifySignature(token: ReturnType<typeof parseToken>, key: AccessJwk): Promise<boolean> {
  const algorithm = algorithmFor(token.header);
  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    key,
    algorithm.importParams,
    false,
    ['verify'],
  );

  return crypto.subtle.verify(
    algorithm.verifyParams,
    cryptoKey,
    token.signature as unknown as BufferSource,
    token.signedData as unknown as BufferSource,
  );
}

export async function verifyAccessJwtAssertion(
  assertion: string,
  options: VerifyOptions,
): Promise<AppIdentity> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const clockSkewSeconds = options.clockSkewSeconds ?? 60;

  const token = parseToken(assertion);
  const teamDomain = normalizeTeamDomain(options.teamDomain);

  verifyClaims(token.payload, teamDomain, options.audience);
  verifyTiming(token.payload, nowSeconds, clockSkewSeconds);

  const keys = await fetchJwks(teamDomain, fetchImpl);
  const candidates = token.header.kid
    ? keys.filter((key) => key.kid === token.header.kid)
    : keys;

  if (!candidates.length) throw new Error('No matching Access verification key.');

  for (const key of candidates) {
    if (await verifySignature(token, key)) {
      const email = token.payload.email as string;
      const fullName =
        typeof token.payload.name === 'string' && token.payload.name
          ? token.payload.name
          : null;

      return {
        userId: token.payload.sub as string,
        email,
        displayName: fullName ?? email,
        fullName,
        provider: 'cloudflare-access',
      };
    }
  }

  throw new Error('Access JWT signature verification failed.');
}
