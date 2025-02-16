import { redirect } from "react-router";

export function action() {
  return redirect("/login", {
    status: 303,
    headers: {
      "Set-Cookie": "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    },
  });
}

export function loader() {
  return redirect("/login", {
    status: 303,
    headers: {
      "Set-Cookie": "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    },
  });
}