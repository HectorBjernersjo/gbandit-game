import { createBrowserRouter } from "react-router";
import { checkAlreadyLoggedIn, requireUser } from "@/lib/loaders";
import { Home } from "@/pages/Home";
import { AuthLayout } from "@/pages/AuthLayout";
import { Dashboard } from "@/pages/Dashboard";
import { NotFound } from "@/pages/NotFound";
import { RouteError } from "@/pages/RouteError";
import { Spinner } from "@/components/Spinner";

export const router = createBrowserRouter([
  {
    path: "/",
    loader: checkAlreadyLoggedIn,
    Component: Home,
    HydrateFallback: Spinner,
  },
  {
    loader: requireUser,
    Component: AuthLayout,
    ErrorBoundary: RouteError,
    HydrateFallback: Spinner,
    children: [
      {
        path: "/dashboard",
        Component: Dashboard,
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
