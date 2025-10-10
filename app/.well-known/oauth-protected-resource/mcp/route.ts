import { metadataCorsOptionsRequestHandler } from 'mcp-handler';
import { protectedResourceHandler } from '../../metadata-handlers';

const handler = (req: Request) => {
  return protectedResourceHandler(req, '/mcp');
};

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
