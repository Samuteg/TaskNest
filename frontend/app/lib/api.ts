const isDev = process.env.NODE_ENV === "development";
const defaultApiUrl = isDev
  ? "http://localhost:5000"
  : "https://tasknest-otql.onrender.com";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/+$/, "");

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
};
