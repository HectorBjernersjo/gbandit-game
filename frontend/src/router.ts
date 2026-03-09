import { createBrowserRouter } from "react-router";
import { optionalUser, requireUser } from "@/lib/loaders";
import { Home } from "@/pages/Home";
import { AuthLayout } from "@/pages/AuthLayout";
import { NotFound } from "@/pages/NotFound";
import { RouteError } from "@/pages/RouteError";
import { Spinner } from "@/components/Spinner";

export const router = createBrowserRouter([
  {
    path: "/",
    loader: optionalUser,
    Component: Home,
    HydrateFallback: Spinner,
  },
  {
    loader: requireUser,
    Component: AuthLayout,
    ErrorBoundary: RouteError,
    HydrateFallback: Spinner,
    children: [],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
