/**
 * By default, Remix will handle generating the HTTP Response for you.
 * You are free to delete this file if you'd like to, but if you ever want it revealed again, you can run `npx remix reveal` ✨
 * For more information, see https://remix.run/file-conventions/entry.server
 */

import { isbot } from "isbot";
import { MuiProvider } from "./mui/mui-provider";
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";
// @ts-ignore
import { renderToReadableStream } from 'react-dom/server.browser';
const ABORT_DELAY = 5000;
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  // This is ignored so we can keep it in the template for visibility.  Feel
  // free to delete this parameter in your app if you're not using it!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadContext: AppLoadContext
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ABORT_DELAY);
  loadContext.env = {
    API_BASE_URL: process.env.API_BASE_URL || "http://localhost:3000",
  }
  const body = await renderToReadableStream(
    <MuiProvider>
      <ServerRouter 
        context={Object.assign(remixContext, { env: loadContext.env })}
        url={request.url}
      />
    </MuiProvider>,
    {
      signal: controller.signal,
      onError(error: unknown) {
        if (!controller.signal.aborted) {
          // Log streaming rendering errors from inside the shell
          console.error(error);
        }
        responseStatusCode = 500;
      },
    }
  );

  body.allReady.then(() => clearTimeout(timeoutId));

  if (isbot(request.headers.get("user-agent") || "")) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}