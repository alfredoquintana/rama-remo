import { createHmac } from 'crypto';

type TokenPayload = {
  sub: number;
  rut: string;
  roles: string[];
  exp: number;
};

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );

  return Buffer.from(padded, 'base64').toString('utf8');
}

function signPart(part: string, secret: string) {
  return createHmac('sha256', secret).update(part).digest('base64url');
}

export function createToken(
  payload: Omit<TokenPayload, 'exp'>,
  secret: string,
  expiresInSeconds = 60 * 60 * 10,
) {
  const completePayload: TokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };
  const encodedPayload = toBase64Url(JSON.stringify(completePayload));
  const signature = signPart(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string, secret: string) {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPart(encodedPayload, secret);

  if (expectedSignature !== signature) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload)) as TokenPayload;

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

export type { TokenPayload };
