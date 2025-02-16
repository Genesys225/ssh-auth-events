import type { NavItemConfig } from "types/nav";
import { paths } from "~/lib/paths";

// NOTE: We did not use React Components for Icons, because
//  you may want to get the config from the server.

// NOTE: First level of navItem elements are groups.

export interface DashboardConfig {
  site: {
    name: string;
  };
	// Overriden by Settings Context.
	layout: "horizontal" | "vertical";
	// Overriden by Settings Context.
	navColor: "blend_in" | "discrete" | "evident";
	navItems: NavItemConfig[];
}

export const appConfig = {
  site: {
    name: "SSH login stats",
  },
	layout: "vertical",
	navColor: "evident",
	navItems: [
		{
			key: "general",
			title: "General",
			items: [
				{
					key: "settings",
					title: "Settings",
					href: paths.settings.account,
					icon: "gear",
					matcher: { type: "startsWith", href: "/settings" },
				},
				
				{
					key: "orders",
					title: "Orders",
					icon: "shopping-cart-simple",
					items: [
						{ key: "orders", title: "List orders", href: paths.events.list },
						{ key: "orders:details", title: "Order details", href: paths.events.details("1") },
					],
				},
			],
		},
	],
} satisfies DashboardConfig;
