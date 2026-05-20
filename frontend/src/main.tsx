import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "./router";
import { initErrorReporter } from "@/lib/error-reporter";
import { startTenantTelemetry } from "@/lib/telemetry";
import { DevToolbar } from "@/lib/dev-auth/DevToolbar";
import "./index.css";

initErrorReporter();
startTenantTelemetry();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    {import.meta.env.DEV && <DevToolbar />}
  </StrictMode>,
);
