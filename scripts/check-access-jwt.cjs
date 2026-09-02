const assert = require('node:assert/strict');
const { createSign, generateKeyPairSync } = require('node:crypto');
const { verifyAccessJwtAssertion } = require('/tmp/portfolio-tests-auth/access-jwt.js');

function b64url(data) {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function signToken(header, payload, privateKeyPem) {
  const head = b64url(JSON.stringify(header));
  const body = b64url(JSON.stringify(payload));
  const signer = createSign('RSA-SHA256');
  signer.update(`${head}.${body}`);
  signer.end();
  const sig = signer.sign(privateKeyPem);
  return `${head}.${body}.${b64url(sig)}`;
}

(async () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const publicJwk = publicKey.export({ format: 'jwk' });
  publicJwk.kid = 'test-key';
  publicJwk.use = 'sig';
  publicJwk.alg = 'RS256';

  const now = Math.floor(Date.now() / 1000);
  const teamDomain = 'example.cloudflareaccess.com';
  const aud = 'test-aud';

  const makePayload = (overrides = {}) => ({
    iss: `https://${teamDomain}`,
    aud,
    sub: 'user-123',
    email: 'owner@example.com',
    name: 'Owner Example',
    iat: now - 20,
    nbf: now - 20,
    exp: now + 3600,
    ...overrides,
  });

  const token = signToken(
    { alg: 'RS256', kid: 'test-key', typ: 'JWT' },
    makePayload(),
    privateKey.export({ format: 'pem', type: 'pkcs1' }),
  );

  const fetchImpl = async () => ({
    ok: true,
    json: async () => ({ keys: [publicJwk] }),
    status: 200,
  });

  const identity = await verifyAccessJwtAssertion(token, {
    teamDomain,
    audience: aud,
    fetchImpl,
    nowSeconds: now,
  });

  assert.equal(identity.userId, 'user-123');
  assert.equal(identity.email, 'owner@example.com');
  assert.equal(identity.provider, 'cloudflare-access');

  await assert.rejects(
    () =>
      verifyAccessJwtAssertion(token, {
        teamDomain,
        audience: 'wrong-aud',
        fetchImpl,
        nowSeconds: now,
      }),
    /audience mismatch/i,
  );

  const expired = signToken(
    { alg: 'RS256', kid: 'test-key', typ: 'JWT' },
    makePayload({ exp: now - 120 }),
    privateKey.export({ format: 'pem', type: 'pkcs1' }),
  );

  await assert.rejects(
    () =>
      verifyAccessJwtAssertion(expired, {
        teamDomain,
        audience: aud,
        fetchImpl,
        nowSeconds: now,
      }),
    /expired/i,
  );

  const noEmail = signToken(
    { alg: 'RS256', kid: 'test-key', typ: 'JWT' },
    makePayload({ email: '' }),
    privateKey.export({ format: 'pem', type: 'pkcs1' }),
  );

  await assert.rejects(
    () =>
      verifyAccessJwtAssertion(noEmail, {
        teamDomain,
        audience: aud,
        fetchImpl,
        nowSeconds: now,
      }),
    /missing email/i,
  );

  console.log('PASS: Access JWT verification and claim enforcement checks.');
})();
