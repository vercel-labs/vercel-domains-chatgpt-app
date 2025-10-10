import { z } from 'zod';

const INTROSPECTION_ENDPOINT =
  'https://api.vercel.com/login/oauth/token/introspect';

const InvalidTokenIntrospectionResponse = z.object({
  active: z.literal(false),
});

const ValidTokenIntrospectionResponse = z.object({
  active: z.literal(true),
  client_id: z.string(),
  exp: z.number(),
  iat: z.number(),
  sub: z.string(),
  iss: z.string(),
  jti: z.string(),
});

const TokenIntrospectionResponse = z.union([
  InvalidTokenIntrospectionResponse,
  ValidTokenIntrospectionResponse,
]);

export interface VercelToken {
  sub: string;
  // exp: number;
  // iat: number;
  // iss: string;
  client_id: string;
}

/** Whether the given string is a Vercel App Token */
export function isVercelAppTokenString(token: string): boolean {
  return token.startsWith('vca_') || isLegacyVercelAppTokenString(token);
}

/**
 * Checkes whether a string that is passed conforms to the legacy Vercel App Token Format
 * To check for both current and legacy formats use {@link isVercelAppTokenString} instead.
 * @deprecated TODO: Remove this when all Vercel Apps have been migrated to the new token format
 */
export function isLegacyVercelAppTokenString(token: string): boolean {
  return token.split('.').length === 3;
}

export async function validateToken(
  token: string
): Promise<VercelToken | undefined> {

  try {
    const response = await fetch(INTROSPECTION_ENDPOINT, {
      method: 'POST',
      body: new URLSearchParams({
        token: token,
      })
    });

    if (response.status !== 200) {
      return undefined;
    }

    const json = await response.json();

    const parseResult = TokenIntrospectionResponse.safeParse(json);
    if (!parseResult.data) {
      return undefined;
    }
    const introspectionResponse = parseResult.data;

    if (!introspectionResponse.active) {
      return undefined;
    }
    return introspectionResponse;
  } catch (error) {
    return undefined;
  }
}
