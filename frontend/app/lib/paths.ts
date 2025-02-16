
export const paths = {
	home: "/",
	auth: {
    signIn: "/login",
    SignOut: "/logout",
	},
  settings: {
    account: "/settings/account",
    security: "/settings/security",
  },
  events: {
    list: "/events",
    preview: (orderId: string) => `/events?previewId=${orderId}`,
    details: (orderId: string) => `/events/${orderId}`,
  },
	notAuthorized: "/errors/not-authorized",
	notFound: "/errors/not-found",
	internalServerError: "/errors/internal-server-error",
} as const;
