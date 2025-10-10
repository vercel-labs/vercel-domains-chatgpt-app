import {
  McpServer,
  ToolCallback,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape } from "zod";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";
import {
  ServerNotification,
  ServerRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { Vercel } from "@vercel/sdk";

export type ToolFn = (args: {
  args: Record<string, unknown>;
  extra: RequestHandlerExtra<ServerRequest, ServerNotification>;
  vercel: Vercel;
  teamId?: string;
  projectId?: string;
}) => Promise<Record<string, unknown>>;

type DefineToolWithVercelParams<Args extends ZodRawShape> = {
  name: string;
  description: string;
  paramsSchema: Args;
  execute: ToolFn;
  projectSpecific?: boolean;
};

export default function defineToolWithVercel<Args extends ZodRawShape>({
  name,
  description,
  paramsSchema,
  execute,
}: DefineToolWithVercelParams<Args>) {
  return (
    server: McpServer,
    teamId?: string,
    projectId?: string,
    projectSpecific?: boolean
  ) => {
    paramsSchema = {
      ...paramsSchema,
    };
    if (teamId) {
      delete paramsSchema.teamId;
    }
    if (projectId) {
      delete paramsSchema.projectId;
    }
    return server.tool(
      name,
      description,
      paramsSchema,
      {
        readOnlyHint: true,
        // openWorldHint: true,
      },
      (async (args, extra) => {
        try {
          const vercel = new Vercel({
            bearerToken: extra.authInfo?.token,
          });

          const result = await execute({
            args,
            extra,
            vercel,
            teamId,
            projectId,
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          throw error;
        }
      }) as ToolCallback<Args>
    );
  };
}
