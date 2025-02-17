import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LoaderFunctionArgs,
} from "react-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import type { Route } from "./+types/root";
import css from "./app.css?url";
import { getMuiLinks } from "./mui/mui-links";
import { MuiMeta } from "./mui/mui-meta";
import { MuiDocument } from "./mui/mui-document";
import { requireAuth } from "./auth/client";
import { useState } from "react";
import { getApiBaseUrl } from "./lib/get-api-url";
import { Toaster } from "sonner";

// export const loader = requireAuth;
export const loader = async (ctx: LoaderFunctionArgs) => {
  const env = {
    API_BACKEND_URL: getApiBaseUrl(),
    API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3000",
  };
  Object.assign(ctx.context, { env });
  const user = await requireAuth(ctx);
  return {
    user,
    env,
  };
};

export const links: Route.LinksFunction = () => [
  ...getMuiLinks(),
  { rel: "stylesheet", href: css },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <MuiMeta />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      })
  );
  return (
    <MuiDocument>
      <QueryClientProvider client={queryClient}>
        <Outlet context={loaderData} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(
              loaderData.env
            )}`,
          }}
        />
        <Toaster position="bottom-right" />
      </QueryClientProvider>
    </MuiDocument>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
