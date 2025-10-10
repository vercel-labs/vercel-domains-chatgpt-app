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
      .optional()
      .describe('The price you expect to be charged for the purchase'),
    renew: z
      .boolean()
      .optional()
      .default(true)
      .describe('Whether the domain should be automatically renewed'),
    country: z
      .string()
      .describe('The country of the domain registrant (e.g., US)'),
    orgName: z
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
    city: z
      .string()
      .describe('The city of the domain registrant'),
    state: z
      .string()
      .describe('The state/province of the domain registrant'),
    postalCode: z
      .string()
      .describe('The postal code of the domain registrant'),
    phone: z
      .string()
      .describe('The phone number of the domain registrant (e.g., +1.4158551452)'),
    email: z
      .string()
      .email()
      .describe('The email address of the domain registrant'),
  },
  execute: async ({ args, vercel, teamId }) => {
    try {
      const requestBody: {
        name: string;
        renew: boolean;
        country: string;
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        phone: string;
        email: string;
        expectedPrice?: number;
        orgName?: string;
      } = {
        name: args.name as string,
        renew: args.renew as boolean,
        country: args.country as string,
        firstName: args.firstName as string,
        lastName: args.lastName as string,
        address1: args.address1 as string,
        city: args.city as string,
        state: args.state as string,
        postalCode: args.postalCode as string,
        phone: args.phone as string,
        email: args.email as string,
      };

      if (args.expectedPrice !== undefined) {
        requestBody.expectedPrice = args.expectedPrice as number;
      }

      if (args.orgName !== undefined) {
        requestBody.orgName = args.orgName as string;
      }

      const result = await vercel.domains.buyDomain({
        ...(teamId && { teamId }),
        requestBody,
      });
      return {
        message: `Domain ${args.name} has been successfully purchased`,
        domain: result.domain,
      };
    } catch (error) {
      
      // Re-throw the error to let the MCP framework handle it
      throw error;
    }
  },
});