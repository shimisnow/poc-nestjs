import crypto from 'k6/crypto';
import encoding from 'k6/encoding';

function signHMAC(data, hashAlg, secret) {
  const hasher = crypto.createHMAC(hashAlg, secret);
  hasher.update(data);
  return hasher.digest('base64url').replace(/=+$/, '');
}

/**
 * Encodes and signs a JWT with HMAC.
 * @param {Object} payload The JWT payload.
 * @param {string} secret The shared secret for HMAC.
 * @returns {string} The signed JWT.
 */
export function generateJwtToken(payload, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const encodedHeader = encoding.b64encode(JSON.stringify(header), 'rawurl');
  const encodedPayload = encoding.b64encode(JSON.stringify(payload), 'rawurl');

  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  const signature = signHMAC(dataToSign, 'sha256', secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
