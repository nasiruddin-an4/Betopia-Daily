"use client";

import React, { useEffect, useState } from "react";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "../../lib/msal";
import { useUserStore } from "../../store/useUserStore";
import { useSidebarStore } from "../../store/useSidebarStore";

export default function MsalProviderWrapper({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    msalInstance
      .initialize()
      .then(() => msalInstance.handleRedirectPromise())
      .then(async (response) => {
        // Back from the Microsoft login page
        if (response?.account) {
          msalInstance.setActiveAccount(response.account);
          const result = await useUserStore.getState().ssoLogin(response.accessToken);
          if (result.success) useSidebarStore.getState().closeLoginModal?.();
        }
      })
      .catch((err) => console.error("MSAL Redirect Error:", err))
      .finally(() => setIsInitialized(true));
  }, []);

  // Don't render the app until MSAL is initialized to avoid the stub error
  if (!isInitialized) return null;

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
