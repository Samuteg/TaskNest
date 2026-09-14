import type { IncomingHttpHeaders } from "node:http";

import type { Context as ApiContext } from "@TaskNest/api/context";
import { fromNodeHeaders } from "better-auth/node";

import { getDb } from "./services";
import { auth } from "./services";

export async function createContext(req: IncomingHttpHeaders): Promise<ApiContext> {
  const db = await getDb();
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req),
  });
  return {
    db,
    auth: null,
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
