
// NOTE: We did not use React Components for Icons, because
//  you may one to get the config from the server.

import type { NavItemConfig } from "types/nav";
import { paths } from "~/lib/paths";

// NOTE: First level elements are groups.

export interface LayoutConfig {
  navItems: NavItemConfig[];
}

export const layoutConfig = {
  navItems: [
    {
      key: 'settings',
      title: 'Settings',
      href: paths.settings.account,
      icon: 'gear',
      matcher: { type: 'startsWith', href: '/settings' },
    },
    {
      key: 'events',
      title: 'Events',
      icon: 'shopping-cart-simple',
      items: [
        { key: 'events', title: 'List events', href: paths.events.list },
        { key: 'events:details', title: 'Events details', href: paths.events.details('1') },
      ],
    },
  ],
} satisfies LayoutConfig;
