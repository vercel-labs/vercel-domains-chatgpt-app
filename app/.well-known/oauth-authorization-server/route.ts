import { metadataCorsOptionsRequestHandler } from 'mcp-handler';
import { authorizationServerHandler } from '../metadata-handlers';

export {
  authorizationServerHandler as GET,
  metadataCorsOptionsRequestHandler as OPTIONS,
};
