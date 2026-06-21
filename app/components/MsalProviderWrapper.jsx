"use client";

import React, { useEffect, useState } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "../../lib/msalConfig";

// Create instance outside the component
const msalInstance = new PublicClientApplication(msalConfig);

export default function MsalProviderWrapper({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    msalInstance.initialize().then(() => {
      msalInstance.handleRedirectPromise().then((response) => {
        if (response && response.accessToken) {
          console.log("====================================");
          console.log("MICROSOFT ACCESS TOKEN RECEIVED:");
          console.log(response.accessToken);
          console.log("====================================");
          
          // Send to DRF backend using the store
          import("../../store/useUserStore").then(({ useUserStore }) => {
            useUserStore.getState().ssoLogin(response.accessToken).then((result) => {
              if (result.success) {
                // Optionally close the login modal if it was open
                import("../../store/useSidebarStore").then(({ useSidebarStore }) => {
                  if (useSidebarStore.getState().closeLoginModal) {
                    useSidebarStore.getState().closeLoginModal();
                  }
                });
              }
            });
          });
        }
        setIsInitialized(true);
      }).catch((err) => {
        console.error("MSAL Redirect Error:", err);
        setIsInitialized(true); // Ensure app still loads
      });
    });
  }, []);

  if (!isInitialized) {
    // Do not render the app until MSAL is initialized to avoid the stub error
    return null; 
  }

  return (
    <MsalProvider instance={msalInstance}>
      {children}
    </MsalProvider>
  );
}
