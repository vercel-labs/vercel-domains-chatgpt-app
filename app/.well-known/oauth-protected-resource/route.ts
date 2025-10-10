// the @modelcontextprotocol/sdk package has issues calculating prm urls with paths
// so we return the metadata from the root route in addition to the mcp route

import { metadataCorsOptionsRequestHandler } from 'mcp-handler';
import { protectedResourceHandler } from '../metadata-handlers';

const handler = (req: Request) => {
  return protectedResourceHandler(req, '/');
};

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
