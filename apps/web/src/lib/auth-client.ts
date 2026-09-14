import { createAuthClient } from "better-auth/react";

const SERVER_URL: string =
	import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000";

function getServerUrl(url: string) {
	if (typeof window !== "undefined" && url.startsWith("/")) {
		return `${window.location.origin}${url}`;
	}
	return url;
}

export const authClient = createAuthClient({
	baseURL: new URL("/api/auth", getServerUrl(SERVER_URL)).toString(),
});
