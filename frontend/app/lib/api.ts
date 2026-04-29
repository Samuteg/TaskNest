const isDev = process.env.NODE_ENV === "development";
const defaultApiUrl = isDev
  ? "http://localhost:5000"
  : "https://task-nest-backend-dusky.vercel.app";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl;

export const apiUrl = (path: string) => `${API_URL}${path}`;
