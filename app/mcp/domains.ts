import { z } from 'zod';
import defineToolWithVercel from './define-tool-with-vercel';

export const checkDomainAvailability = defineToolWithVercel({
  name: 'check_domain_availability_and_price',
  description: 'Check if domain names are available for purchase and get pricing information',
  paramsSchema: {
    names: z
      .array(z.string().min(1, "Domain name cannot be empty")).max(10, "You can only check up to 10 domains at a time")
      .min(1, "At least one domain name is required")
      .describe('Array of domain names to check availability for (e.g., ["example.com", "test.org"])'),
  },
  execute: async ({ args, vercel, teamId }) => {
    const names = args.names as string[];
    
    // Process all domains in parallel using Promise.all
    const results = await Promise.all(
      names.map(async (name) => {
        try {
          // Check availability
          const availabilityResult = await vercel.domains.checkDomainStatus({ name });
          const available = availabilityResult.available;
          
          let price = null;
          let period = null;
          let priceError = null;
          
          // If domain is available, also check pricing
          if (available) {
            try {
              const priceResult = await vercel.domains.checkDomainPrice({ name });
              price = priceResult.price;
              period = priceResult.period;
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

    const availableCount = results.filter(r => r.available).length;
    const totalCount = results.length;
    const totalPrice = results
      .filter(r => r.available && r.price !== null)
      .reduce((sum, r) => sum + (r.price || 0), 0);
    
    return {
      message: `Checked ${totalCount} domain${totalCount > 1 ? 's' : ''}: ${availableCount} available, ${totalCount - availableCount} unavailable or failed${totalPrice > 0 ? `. Total cost for available domains: $${totalPrice} USD` : ''}`,
      results,
      summary: {
        total: totalCount,
        available: availableCount,
        unavailable: totalCount - availableCount,
        totalPrice,
      },
    };
  },
});

export const buyDomain = defineToolWithVercel({
  name: 'buy_domain',
  description: 'Purchase a domain name with registrant information',
  paramsSchema: {
    name: z
      .string()
      .describe('The domain name to purchase (e.g., example.com)'),
    expectedPrice: z
      .number()
      .describe('The price you expect to be charged for the purchase'),
    years: z
      .number()
      .optional()
      .default(1)
      .describe('The number of years to purchase the domain for (default: 1)'),
    autoRenew: z
      .boolean()
      .optional()
      .default(true)
      .describe('Whether the domain should be automatically renewed'),
    teamId: z
      .string()
      .optional()
      .describe('The team ID to purchase the domain for'),
    country: z
      .string()
      .describe('The country of the domain registrant (ISO 3166-1 alpha-2, e.g., US)'),
    companyName: z
      .string()
      .optional()
      .describe('The company name of the domain registrant'),
    firstName: z
      .string()
      .describe('The first name of the domain registrant'),
    lastName: z
      .string()
      .describe('The last name of the domain registrant'),
    address1: z
      .string()
      .describe('The street address of the domain registrant'),
    address2: z
      .string()
      .optional()
      .describe('Additional address line (optional)'),
    city: z
      .string()
      .describe('The city of the domain registrant'),
    state: z
      .string()
      .describe('The state/province of the domain registrant'),
    zip: z
      .string()
      .describe('The postal/zip code of the domain registrant'),
    phone: z
      .string()
      .describe('The phone number of the domain registrant (E.164 format, e.g., +14158551452)'),
    email: z
      .string()
      .email()
      .describe('The email address of the domain registrant'),
  },
  execute: async ({ args, vercel, teamId }) => {
    try {
      const result = await vercel.domainsRegistrar.buyDomains({
        teamId: (args.teamId as string | undefined) || teamId,
        requestBody: {
          domains: [
            {
              domainName: args.name as string,
              autoRenew: (args.autoRenew as boolean) ?? true,
              years: (args.years as number) ?? 1,
              expectedPrice: args.expectedPrice as number,
            }
          ],
          contactInformation: {
            firstName: args.firstName as string,
            lastName: args.lastName as string,
            email: args.email as string,
            phone: args.phone as string,
            address1: args.address1 as string,
            address2: args.address2 as string | undefined,
            city: args.city as string,
            state: args.state as string,
            zip: args.zip as string,
            country: args.country as string,
            companyName: args.companyName as string | undefined,
          },
        },
      });
      
      return {
        message: `Domain ${args.name} has been successfully purchased`,
        result,
      };
    } catch (error) {
      // Re-throw the error to let the MCP framework handle it
      throw error;
    }
  },
});