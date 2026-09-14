import type { AppRouterClient } from "@TaskNest/api/routers/index";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SERVER_URL: string =
	import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

function getServerUrl(url: string) {
	if (typeof window !== "undefined" && url.startsWith("/")) {
		return `${window.location.origin}${url}`;
	}
	return url;
}

export function createQueryClient() {
	return new QueryClient({
		queryCache: new QueryCache({
			onError: (error, query) => {
				toast.error(`Error: ${error.message}`, {
					action: {
						label: "retry",
						onClick: () => {
							query.invalidate();
						},
					},
				});
			},
		}),
	});
}

export const queryClient = createQueryClient();

export const link = new RPCLink({
	fetch(url, options) {
		return fetch(url, {
			...options,
			credentials: "include",
		});
	},
	url: `${getServerUrl(SERVER_URL)}/rpc`,
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
