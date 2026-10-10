import type { Database } from "@TaskNest/db";
import * as schema from "@TaskNest/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export type AuthConfig = {
	BETTER_AUTH_URL: string;
	BETTER_AUTH_SECRET: string;
	CORS_ORIGIN: string;
	NODE_ENV: string;
	RESEND_API_KEY?: string;
	EMAIL_FROM?: string;
};

export type SendEmail = (args: {
	to: string;
	subject: string;
	text: string;
}) => Promise<void>;

const DEV_VERIFY_TTL_MS = 60_000;

export function createEmailService(env: AuthConfig): {
	sendEmail: SendEmail | null;
	devOutbox: { to: string; subject: string; text: string }[] | null;
} {
	// Dev/test fallback: log the link instead of delivering it. No new
	// dependency; production requires RESEND_API_KEY (fail-closed below).
	if (!env.RESEND_API_KEY) {
		if (env.NODE_ENV === "production") {
			throw new Error(
				"RESEND_API_KEY is required in production for email verification"
			);
		}
		const devOutbox: { to: string; subject: string; text: string }[] = [];
		return {
			devOutbox,
			sendEmail: (args) => {
				devOutbox.push(args);
				const ttl = env.NODE_ENV === "test" ? DEV_VERIFY_TTL_MS : undefined;
				if (ttl !== undefined) {
					setTimeout(() => {
						const index = devOutbox.indexOf(
							args as { to: string; subject: string; text: string }
						);
						if (index >= 0) {
							devOutbox.splice(index, 1);
						}
					}, ttl).unref?.();
				}
				console.log(`[auth] verification link for ${args.to}: ${args.text}`);
				return Promise.resolve();
			},
		};
	}
	const apiKey = env.RESEND_API_KEY;
	const from = env.EMAIL_FROM ?? "TaskNest <onboarding@resend.dev>";
	return {
		devOutbox: null,
		sendEmail: async (args) => {
			const response = await fetch("https://api.resend.com/emails", {
				body: JSON.stringify({ from, subject: args.subject, to: args.to }),
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				method: "POST",
			});
			if (!response.ok) {
				throw new Error(`Email send failed: ${response.status}`);
			}
		},
	};
}

export function createAuth(
	env: AuthConfig,
	database: Database,
	desktopOrigins: readonly string[] = [],
	emailService?: { sendEmail: SendEmail | null }
) {
	const isProduction = env.NODE_ENV === "production";
	const { sendEmail } = emailService ?? createEmailService(env);
	return betterAuth({
		advanced: {
			defaultCookieAttributes: {
				httpOnly: true,
				// ponytail: single-origin today; use "none" only if web/api ever split across sites (requires secure:true).
				sameSite: "lax",
				secure: isProduction,
			},
		},
		baseURL: env.BETTER_AUTH_URL,
		database: drizzleAdapter(database, {
			provider: "pg",
			schema,
		}),
		emailAndPassword: {
			enabled: true,
			minPasswordLength: 12,
			requireEmailVerification: true,
		},
		emailVerification: sendEmail
			? {
					sendOnSignUp: true,
					sendVerificationEmail({ user, url }) {
						return sendEmail({
							subject: "Verify your TaskNest email",
							text: url,
							to: user.email,
						});
					},
				}
			: undefined,
		plugins: [],
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [env.CORS_ORIGIN, ...desktopOrigins],
	});
}
