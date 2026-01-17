
import { SignJWT } from 'jose';

/**
 * Converts a hex string to a Uint8Array.
 * Ghost Admin API secrets are hex-encoded.
 */
function hexToUint8Array(hex: string): Uint8Array {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) throw new Error('Invalid hex string');
  return new Uint8Array(matches.map(byte => parseInt(byte, 16)));
}

/**
 * Creates a JWT for Ghost Admin API authentication.
 * @param apiKey The Ghost Admin API Key (format: "id:secret")
 */
export async function createGhostJWT(apiKey: string): Promise<string> {
  const [id, secret] = apiKey.split(':');
  if (!id || !secret) {
    throw new Error('Invalid Ghost API Key format. Expected "id:secret"');
  }

  const secretBytes = hexToUint8Array(secret);

  const token = await new SignJWT({ aud: '/admin/' })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT', kid: id })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(secretBytes);

  return token;
}
