import { ENV } from "./env.js";

const normalizeUrl = (value: string) => value.replace(/\/+$/, "");

const parseAllowedOrigins = () =>
  [ENV.FRONTEND_URL, "http://localhost:3000"]
    .flatMap((value) => (value ? value.split(",") : []))
    .map((value) => value.trim())
    .filter(Boolean)
    .map(normalizeUrl);

const wildcardToRegExp = (value: string) => {
  const escaped = value.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`);
};

export const createCorsOriginChecker = () => {
  const allowedOrigins = parseAllowedOrigins();
  const wildcardPatterns = allowedOrigins
    .filter((origin) => origin.includes("*"))
    .map(wildcardToRegExp);
  const exactOrigins = new Set(allowedOrigins.filter((origin) => !origin.includes("*")));

  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeUrl(origin);
    if (exactOrigins.has(normalizedOrigin)) {
      callback(null, true);
      return;
    }

    if (wildcardPatterns.some((pattern) => pattern.test(normalizedOrigin))) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"), false);
  };
};
