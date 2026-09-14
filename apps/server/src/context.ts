import type { Context as ApiContext } from "@TaskNest/api/context";
import type { IncomingHttpHeaders } from "node:http";
import { fromNodeHeaders } from "better-auth/node";
import { auth, getDb } from "./services";

export async function createContext(
	req: IncomingHttpHeaders
): Promise<ApiContext> {
	const db = await getDb();
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req),
	});
	return {
		auth: null,
		db,
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
