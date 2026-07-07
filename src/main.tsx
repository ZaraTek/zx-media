import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import { LibraryProvider } from "./context/LibraryContext";
import "./index.css";

const googleClientId = (import.meta.env.GOOGLE_CLIENT_ID as string | undefined) ?? "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <LibraryProvider>
          <App />
        </LibraryProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
