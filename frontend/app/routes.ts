import { type RouteConfig } from "@react-router/dev/routes";
import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";

export default remixRoutesOptionAdapter((defineRoutes) => {
  return defineRoutes((route) => {
    route("/", "routes/layout.tsx", () => {
      route("/", "routes/home.tsx", { index: true });
      route("/events", "routes/events/list.tsx");
      route("/events/$orderId", "routes/events/details.tsx");
    });
    route("/login", "routes/auth/sign-in.tsx");
    route("/logout", "routes/auth/sign-out.ts");
  });
}) satisfies RouteConfig;