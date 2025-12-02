import { phoneNumberClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const apiBaseUrl = import.meta.env.VITE_AUTH_BASE_URL ?? window.location.origin;

export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
  plugins: [phoneNumberClient()],
});
