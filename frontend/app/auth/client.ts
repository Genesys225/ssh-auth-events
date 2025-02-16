import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { paths } from "~/lib/paths";

// Helper to fetch the auth token from cookies
function getAuthToken(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  
  const match = cookieHeader.match(/auth_token=([^;]+)/);
  return match ? match[1] : null;
}

export async function login(email: string, password: string, baseUrl: string) {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });

  if (!response.ok) {
    return { success: false, error: "Invalid credentials" };
  }

  const { token, requirePasswordChange } = await response.json();
  return { success: true, token, requirePasswordChange };
}

export async function requireAuth({ request, context: { env } }: LoaderFunctionArgs) {
  const baseApiUrl = env.API_BASE_URL;
  const token = getAuthToken(request);
  const { pathname } = new URL(request.url);
  if (pathname.startsWith('/login') && !token) return {};
  // console.log({ pathname, token });
  
  if (!token) throw redirect("/login");

  try {
    const response = await fetch(`${baseApiUrl}/auth/verify-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw redirect("/login");
    if (pathname.startsWith('/login')) {
      return redirect(paths.events.list);
    }
    const user = await response.json();
    // console.log({ user });
    return user;
  } catch (error) {
    console.error("Error verifying token:", error);
    return redirect("/login");
  }
}

export async function loginAction({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const baseApiUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const response = await login(username, password, baseApiUrl);
  
  if (!response.success) {
    return new Response(JSON.stringify({ error: response.error }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  const { protocol } = new URL(request.url);
  const secure = protocol === 'https:' ? '; Secure' : '';

  throw redirect(response.requirePasswordChange ? "/change-password" : paths.events.list, {
    status: 302,
    headers: {
      Location: response.requirePasswordChange ? "/change-password" : paths.events.list,
      "Set-Cookie": `auth_token=${response.token}; Path=/; HttpOnly;${secure} SameSite=Lax`,
    },
  });
}