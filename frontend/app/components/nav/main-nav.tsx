import * as React from 'react';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import type { NavItemConfig } from 'types/nav';
import { MobileNav } from './mobile-nav';
import { useDialog } from '~/hooks/use-dialog';
import { SearchDialog } from '../search-dialog';
import { NotificationsPopover } from './notifications-popover';
import { usePopover } from '~/hooks/use-popover';
import { UserPopover } from './user-popover/user-popover';
import { Avatar, Badge, Box, Divider, IconButton, Stack, Tooltip } from '@mui/material';
import localforage from 'localforage';
import { useSSE } from '~/hooks/use-sse';
import { getApiBaseUrl } from '~/lib/get-api-url';
import type { SSHEvent } from 'actions/events';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';


export interface MainNavProps {
  items: NavItemConfig[];
}

interface SSHAuthNotification extends SSHEvent {
  seen: boolean;
  type: 'event' | 'log';
}


export function MainNav({ items }: MainNavProps): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          '--MainNav-background': 'var(--mui-palette-background-default)',
          '--MainNav-divider': 'var(--mui-palette-divider)',
          bgcolor: 'var(--MainNav-background)',
          left: 0,
          position: 'sticky',
          pt: { lg: 'var(--Layout-gap)' },
          top: 0,
          width: '100%',
          zIndex: 'var(--MainNav-zIndex)',
        }}
      >
        <Box
          sx={{
            borderBottom: '1px solid var(--MainNav-divider)',
            display: 'flex',
            flex: '1 1 auto',
            minHeight: 'var(--MainNav-height)',
            px: { xs: 2, lg: 3 },
            py: 1,
          }}
        >
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto' }}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
            <SearchButton />
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', flex: '1 1 auto', justifyContent: 'flex-end' }}
          >
            <NotificationsButton />
            <Divider
              flexItem
              orientation="vertical"
              sx={{ borderColor: 'var(--MainNav-divider)', display: { xs: 'none', lg: 'block' } }}
            />
            <UserButton />
          </Stack>
        </Box>
      </Box>
      <MobileNav
        items={items}
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}

function SearchButton(): React.JSX.Element {
  const dialog = useDialog();

  return (
    <React.Fragment>
      <Tooltip title="Search">
        <IconButton onClick={dialog.handleOpen} sx={{ display: { xs: 'none', lg: 'inline-flex' } }}>
          <MagnifyingGlassIcon />
        </IconButton>
      </Tooltip>
      <SearchDialog onClose={dialog.handleClose} open={dialog.open} />
    </React.Fragment>
  );
}

const maxAge = 1000 * 60 * 60 * 24 * 7; // 7 days

function NotificationsButton(): React.JSX.Element {
  const popover = usePopover<HTMLButtonElement>();
  const [notifications, setNotifications] = React.useState<SSHAuthNotification[]>([]);
  const queryClient = useQueryClient();
  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const storedNotifications = await localforage.getItem<SSHAuthNotification[]>("notifications");
        if (storedNotifications) {
          const now = Date.now();
          const freshNotifications = storedNotifications.filter((n) => now - n.timestamp < maxAge);
          setNotifications(freshNotifications);
          if (freshNotifications.length !== storedNotifications.length) {
            localforage.setItem("notifications", freshNotifications).catch((error) => {
              console.error("Error saving notifications to storage:", error);
            });
          }
        }
      } catch (error) {
        console.error("Error loading notifications from storage:", error);
      }
    };
    fetchNotifications();
  }, []);

  // Subscribe to SSE for real-time updates
  useSSE<SSHAuthNotification>(getApiBaseUrl() + "/api/log-events/stream", (event) => {
    if (!event.timestamp) return;
    setNotifications((prev) => {
      // Prevent duplicate entries
      if (prev.some((n) => n.timestamp === event.timestamp)) return prev;
      toast.success("New event received!");
      event.seen = false;
      const updated = [event, ...prev].slice(0, 100); // Keep last 100 notifications

      // Properly handle the async storage update
      localforage.setItem("notifications", updated).catch((error) => {
        console.error("Error saving notifications to storage:", error);
      });
      queryClient.invalidateQueries({ queryKey: ['events', 'pagination'], exact: false });
      return updated;
    });
  });

  const handleRemoveOne = (timestamp: number) => {
    setNotifications((prev) => {
      const updated = prev.filter((notification) => notification.timestamp !== timestamp);
      localforage.setItem("notifications", updated).catch((error) => {
        console.error("Error saving notifications to storage:", error);
      });
      return updated;
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((notification) => ({ ...notification, seen: true }));
      localforage.setItem("notifications", updated).catch((error) => {
        console.error("Error saving notifications to storage:", error);
      });
      return updated;
    });
  }

  const hasUnseen = notifications.some((n) => !n.seen);

  return (
    <React.Fragment>
      <Tooltip title="Notifications">
        <Badge
          color="error"
          sx={{ '& .MuiBadge-dot': { borderRadius: '50%', height: '10px', right: '6px', top: '6px', width: '10px' } }}
          variant="dot"
          invisible={!hasUnseen}
        >
          <IconButton onClick={popover.handleOpen} ref={popover.anchorRef}>
            <BellIcon />
          </IconButton>
        </Badge>
      </Tooltip>
      <NotificationsPopover<SSHAuthNotification>
        onMarkAllAsRead={handleMarkAllAsRead}
        onRemoveOne={handleRemoveOne}
        anchorEl={popover.anchorRef.current}
        onClose={popover.handleClose}
        open={popover.open}
        notifications={notifications}
      />
    </React.Fragment>
  );
}


const user = {
  id: 'USR-000',
  name: 'Sofia Rivers',
  avatar: '/assets/avatar.png',
  email: 'sofia@devias.io',
};

function UserButton(): React.JSX.Element {
  const popover = usePopover<HTMLButtonElement>();

  return (
    <React.Fragment>
      <Box
        component="button"
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        sx={{ border: 'none', background: 'transparent', cursor: 'pointer', p: 0 }}
      >
        <Badge
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          color="success"
          sx={{
            '& .MuiBadge-dot': {
              border: '2px solid var(--MainNav-background)',
              borderRadius: '50%',
              bottom: '6px',
              height: '12px',
              right: '6px',
              width: '12px',
            },
          }}
          invisible
          variant="dot"
        >
          <Avatar />
        </Badge>
      </Box>
      <UserPopover anchorEl={popover.anchorRef.current} onClose={popover.handleClose} open={popover.open} />
    </React.Fragment>
  );
}
