import { metadataCorsOptionsRequestHandler } from 'mcp-handler';
import { authorizationServerHandler } from '../metadata-handlers';

const corsHandler = metadataCorsOptionsRequestHandler();

export {
  authorizationServerHandler as GET,
  corsHandler as OPTIONS,
};