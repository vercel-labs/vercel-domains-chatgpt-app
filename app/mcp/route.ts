import { baseURL } from "@/baseUrl";
import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import { validateToken } from "./auth-utils";
// import { buyDomain } from "./domains";
import { Vercel } from "@vercel/sdk";

const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const handler = createMcpHandler(
  async (server) => {
  const html = await getAppsSdkCompatibleHtml(baseURL, "/");

  // Domain widget configuration
  const domainWidget: ContentWidget = {
    id: "domain_search",
    title: "Domain Search",
    templateUri: "ui://widget/domain-template.html",
    invoking: "Checking domain availability...",
    invoked: "Domain search complete",
    html: html,
    description: "Search and display domain availability and pricing",
  };

  server.registerResource(
    "domain-widget",
    domainWidget.templateUri,
    {
      title: domainWidget.title,
      description: domainWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": domainWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${domainWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": domainWidget.description,
            "openai/widgetPrefersBorder": true,
          },
        },
      ],
    })
  );

  // Register custom domain availability tool with widget support
  server.registerTool(
    'check_domain_availability_and_price',
    {
      title: 'Check Domain Availability',
      description: 'Check if domain names are available for purchase and get pricing information',
      inputSchema: {
        names: z
          .array(z.string().min(1, "Domain name cannot be empty")).max(10, "You can only check up to 10 domains at a time")
          .min(1, "At least one domain name is required")
          .describe('Array of domain names to check availability for (e.g., ["example.com", "test.org"])'),
        teamId: z.string().optional().describe('The team ID to check domain availability for'),
      },
      _meta: widgetMeta(domainWidget),
    },
    async ({ names, teamId }, extra) => {
      try {
        const vercel = new Vercel({
          bearerToken: extra.authInfo?.token,
        });

        // Use bulk availability check for efficiency
        const bulkResult = await vercel.domainsRegistrar.getBulkAvailability({
          teamId: teamId,
          requestBody: {
            domains: names,
          },
        });

        // Process results and get pricing for available domains
        const results = await Promise.all(
          names.map(async (name: string) => {
            try {
              const domainAvailability = bulkResult.results?.find((d: { domain: string; available: boolean }) => d.domain === name);
              const available = domainAvailability?.available ?? false;
              
              let price = null;
              let period = null;
              let priceError = null;
              
              if (available) {
                try {
                  const priceResult = await vercel.domainsRegistrar.getDomainPrice({
                    domain: name,
                    teamId: teamId,
                  });

                  price = priceResult.purchasePrice;
                  period = priceResult.years;
                } catch (priceErr) {
                  priceError = priceErr instanceof Error ? priceErr.message : 'Unknown price check error';
                }
              }
              
              const message = available 
                ? (price !== null && period !== null
                   ? `Domain ${name} is available for $${price} USD for ${period} year${period > 1 ? 's' : ''}`
                   : `Domain ${name} is available (price check failed: ${priceError})`)
                : `Domain ${name} is not available for purchase`;
              
              return {
                name,
                available,
                price,
                period,
                priceError,
                message,
              };
            } catch (error) {          
              return {
                name,
                available: false,
                price: null,
                period: null,
                error: error instanceof Error ? error.message : 'Unknown error',
                message: `Failed to check availability for domain ${name}`,
              };
            }
          })
        );

        const availableCount = results.filter((r: any) => r.available).length;
        const totalCount = results.length;
        const totalPrice = results
          .filter((r: any) => r.available && r.price !== null)
          .reduce((sum: number, r: any) => sum + (r.price || 0), 0);
        
        return {
          content: [
            {
              type: "text",
              text: `Checked ${totalCount} domain${totalCount > 1 ? 's' : ''}: ${availableCount} available`,
            },
          ],
          structuredContent: {
            message: `Checked ${totalCount} domain${totalCount > 1 ? 's' : ''}: ${availableCount} available, ${totalCount - availableCount} unavailable or failed${totalPrice > 0 ? `. Total cost for available domains: $${totalPrice} USD` : ''}`,
            results,
            summary: {
              total: totalCount,
              available: availableCount,
              unavailable: totalCount - availableCount,
              totalPrice,
            },
          },
          _meta: widgetMeta(domainWidget),
        };
      } catch (error) {
        throw error;
      }
    }
  );

  // Register buy domain tool
  // buyDomain(server);
},
  {
    serverInfo: {
      name: 'Vercel MCP Server',
      version: '2',
    },
  },
  {
    basePath: '/',
    // streamableHttpEndpoint: '/',
  },
);

const authHandler = withMcpAuth(
  handler,
  async (_, token) => {
    if (!token) {
      return undefined;
    }

    try {
      const vercelToken = await validateToken(token);

      if (!vercelToken) {
        return undefined;
      }

      return {
        token,
        scopes: [],
        clientId: vercelToken.client_id,
        extra: {
          sub: vercelToken.sub,
        },
      };
    } catch (error) {
      return undefined;
    }
  },
  {
    required: true,
    resourceMetadataPath: '/.well-known/oauth-protected-resource/mcp',
  },
);



export const GET = authHandler;
export const POST = authHandler;
