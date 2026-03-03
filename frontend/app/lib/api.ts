export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://tasknest-otql.onrender.com";

export const apiUrl = (path: string) => `${API_URL}${path}`;
