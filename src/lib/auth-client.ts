import { createAuthClient } from "better-auth/react";

const apiBaseUrl =
  import.meta.env.VITE_AUTH_BASE_URL ||
  // Fallback to API dev server port
  "http://localhost:5174";

export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
});
