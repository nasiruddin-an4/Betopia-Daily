import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./msalConfig";

// Single MSAL instance shared by the provider and the stores
export const msalInstance = new PublicClientApplication(msalConfig);

/**
 * Returns a fresh Microsoft access token for the signed-in account
 * (MSAL renews it silently when the old one expires). Null if not signed in.
 */
export async function getAccessToken() {
  try {
    await msalInstance.initialize();
    const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
    if (!account) return null;
    const res = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
    return res.accessToken;
  } catch (err) {
    console.warn("Could not refresh Microsoft token:", err?.errorCode || err?.message);
    return null;
  }
}
