import { createAuthClient } from "better-auth/react";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";
import { magicLinkClient, emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.CONVEX_SITE_URL,
  plugins: [convexClient(), crossDomainClient(), magicLinkClient(), emailOTPClient()],
});
