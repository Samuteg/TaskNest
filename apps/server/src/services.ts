import { createAuth as createConfiguredAuth } from "@TaskNest/auth";
import { type Database, createDb } from "@TaskNest/db";

import { env } from "./env.server";

const db = createDb(env);

export function getDb(): Database {
  return db;
}
export const auth = createConfiguredAuth(env, db);
