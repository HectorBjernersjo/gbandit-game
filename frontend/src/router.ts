import { createBrowserRouter } from "react-router";
import { optionalUser, requireUser } from "@/lib/loaders";
import { Home } from "@/pages/Home";
import { AuthLayout } from "@/pages/AuthLayout";
import { NotFound } from "@/pages/NotFound";
import { RouteError } from "@/pages/RouteError";
import { Spinner } from "@/components/Spinner";

export const router = createBrowserRouter([
  {
    ErrorBoundary: RouteError,
    HydrateFallback: Spinner,
    children: [
      {
        path: "/",
        loader: optionalUser,
        Component: Home,
      },
      {
        loader: requireUser,
        Component: AuthLayout,
        children: [],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
