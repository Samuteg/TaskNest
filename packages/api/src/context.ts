import type { createAuth } from "@TaskNest/auth";
import type { Database } from "@TaskNest/db";

export type Context = {
  auth: null;
  session: Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>;
  db: Database;
};
