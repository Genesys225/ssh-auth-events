import * as React from 'react';
import { ChatText as ChatTextIcon } from '@phosphor-icons/react/dist/ssr/ChatText';
import { EnvelopeSimple as EnvelopeSimpleIcon } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';
import dayjs from 'dayjs';
import {
  Avatar,
  IconButton,
  List,
  ListItem,
  Popover,
  Tooltip,
  Typography,
  Box,
  Stack,
  Badge,
} from '@mui/material';

export type SeeableNotification = {
  seen: boolean;
  id: number;
  timestamp: number;
  rawMessage: string;
  [key: string]: any;
};

export interface NotificationsPopoverProps<T> {
  anchorEl: null | Element;
  onClose?: () => void;
  onMarkAllAsRead?: () => void;
  onRemoveOne?: (id: number) => void;
  open?: boolean;
  notifications: T[];
}

export function NotificationsPopover<T extends SeeableNotification>({
  anchorEl,
  onClose,
  onMarkAllAsRead,
  onRemoveOne,
  open = false,
  notifications,
}: NotificationsPopoverProps<T>): React.JSX.Element {
  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '380px' } } }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h6">Notifications</Typography>
        {notifications.length > 0 && (
          <Tooltip title="Mark all as read">
            <IconButton edge="end" onClick={onMarkAllAsRead} size="small">
              <EnvelopeSimpleIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
      {notifications.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2">
            There are no notifications
          </Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: '270px', overflowY: 'auto' }}>
          <List disablePadding>
            {notifications.map((notification, index) => (
              <NotificationItem
                divider={index < notifications.length - 1}
                key={notification.timestamp}
                notification={notification}
                onRemove={() => onRemoveOne?.(notification.timestamp)}
              />
            ))}
          </List>
        </Box>
      )}
    </Popover>
  );
}

interface NotificationItemProps<T> {
  divider?: boolean;
  notification: T;
  onRemove?: () => void;
}

function NotificationItem<T extends SeeableNotification>({
  divider,
  notification,
  onRemove,
}: NotificationItemProps<T>): React.JSX.Element {
  return (
    <ListItem
      divider={divider}
      sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
    >
      <NotificationContent notification={notification} />
      <Tooltip title="Remove">
        <IconButton edge="end" onClick={onRemove} size="small">
          <XIcon />
        </IconButton>
      </Tooltip>
      <Badge color="error" variant="dot" invisible={notification.seen} />
    </ListItem>
  );
}

interface NotificationContentProps<T> {
  notification: T;
}

function NotificationContent<T extends SeeableNotification>({
  notification,
}: NotificationContentProps<T>): React.JSX.Element {
  if (notification.status === 'success') {
    return (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Avatar>
          <ChatTextIcon fontSize="var(--Icon-fontSize)" />
        </Avatar>
        <div>
          <Typography variant="subtitle2">New login event!</Typography>
          <Typography variant="body2">{notification.raw_message}</Typography>
          <Typography color="text.secondary" variant="caption">
            {dayjs(notification.timestamp).format('MMM D, hh:mm A')}
          </Typography>
        </div>
      </Stack>
    );
  }

  if (notification.status === 'failed') {
    return (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Avatar>
          <ChatTextIcon fontSize="var(--Icon-fontSize)" />
        </Avatar>
        <div>
          <Typography variant="subtitle2" color="error">
            New FAILED login attempt!
          </Typography>
          <Typography variant="body2">{notification.raw_message}</Typography>
          <Typography color="text.secondary" variant="caption">
            {dayjs(notification.timestamp).format('MMM D, hh:mm A')}
          </Typography>
        </div>
      </Stack>
    );
  }

  return <div />;
}
