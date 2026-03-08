const DEFAULT_API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://tasknest-1-nrsr.onrender.com";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

export const apiUrl = (path: string) => `${API_URL}${path}`;
