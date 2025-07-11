import crypto from 'k6/crypto';
import encoding from 'k6/encoding';

const JWT_ALGORITHM = 'HS256'; // Or HS384, HS512

const algToHash = {
  HS256: 'sha256',
  HS384: 'sha384',
  HS512: 'sha512',
};

function base64urlEncode(str) {
  return encoding.b64encode(str, 'rawurl');
}

function signHMAC(data, hashAlg, secret) {
  const hasher = crypto.createHMAC(hashAlg, secret);
  hasher.update(data);
  let signature = hasher.digest('base64url'); // Should ideally be correct

  // Explicitly remove padding characters if present (shouldn't be if k6 is new enough)
  signature = signature.replace(/=+$/, '');

  return signature;
}

/**
 * Encodes and signs a JWT with HMAC.
 * @param {Object} payload The JWT payload.
 * @param {string} secret The shared secret for HMAC.
 * @param {string} algorithm The signing algorithm (e.g., 'HS256').
 * @returns {string} The signed JWT.
 */
export function generateJwtHMAC(payload, secret, algorithm = JWT_ALGORITHM) {
  const header = {
    alg: algorithm,
    typ: 'JWT',
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));

  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const signature = signHMAC(dataToSign, algToHash[algorithm], secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
