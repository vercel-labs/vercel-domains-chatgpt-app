export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

const baseUrl = 'https://vercel.com';

export const protectedResourceHandler = (
  req: Request,
  resourcePath: string,
) => {
  const origin = new URL(req.url).origin;

  return Response.json(
    {
      // Note: VS Code needed the trailing slash to work
      resource: `${origin}${resourcePath}`,
      authorization_servers: [`${origin}`],
      // Some clients like Claude.ai send invalid scopes like "claudeai"
      // if we don't include a supported scopes list
      scopes_supported: ['openid', 'offline_access'],
      resource_name: 'Vercel MCP',
      resource_documentation: `https://vercel.com/docs/mcp/vercel-mcp`,
    },
    {
      headers: {
        ...corsHeaders,
        // "Cache-Control": "max-age=3600",
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    },
  );
};

export const authorizationServerHandler = () => {
  return Response.json(
    {
      issuer: baseUrl,
      jwks_uri: `${baseUrl}/.well-known/jwks`,
      authorization_endpoint: `${baseUrl}/oauth/authorize`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint: `${baseUrl}/api/login/oauth/token`,
      token_endpoint_auth_methods_supported: ['none'],
      revocation_endpoint: `${baseUrl}/api/login/oauth/token/revoke`,
      revocation_endpoint_auth_methods_supported: ['none'],
      registration_endpoint: `${baseUrl}/api/login/oauth/register`,
      scopes_supported: ['openid', 'email', 'offline_access', 'profile'],
    },
    {
      headers: {
        ...corsHeaders,
        // "Cache-Control": "max-age=3600",
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    },
  );
};
