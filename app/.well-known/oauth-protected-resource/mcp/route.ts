import { metadataCorsOptionsRequestHandler } from 'mcp-handler';
import { protectedResourceHandler } from '../../metadata-handlers';

const handler = (req: Request) => {
  return protectedResourceHandler(req, '/mcp');
};

export { handler as GET, metadataCorsOptionsRequestHandler as OPTIONS };
