import * as React from 'react';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { XCircle as XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import { Minus as MinusIcon } from '@phosphor-icons/react/dist/ssr/Minus';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import dayjs from 'dayjs';
import { DataTable, type ColumnDef } from '../data-table/data-table';
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';

export interface SSHEvent {
  id: number;
  timestamp: number;
  eventType: string;
  username: string;
  ipAddress: string;
  status: string;
  rawMessage: string;
  created_at: number;
  authMethod: string;
  hostname: string;
}

const columns = [
  {
    formatter: (row): React.JSX.Element => (
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            bgcolor: 'var(--mui-palette-background-level1)',
            borderRadius: 1.5,
            flex: '0 0 auto',
            p: '4px 8px',
            textAlign: 'center',
          }}
        >
          <Typography variant="caption">{dayjs(row.timestamp).format('MMM').toUpperCase()}</Typography>
          <Typography variant="h6">{dayjs(row.timestamp).format('D')}</Typography>
        </Box>
        <div>
          <Typography variant="subtitle2">{row.username}</Typography>
          <Typography color="text.secondary" variant="body2">
            {row.ipAddress} • {row.hostname}
          </Typography>
        </div>
      </Stack>
    ),
    name: 'Event',
    width: '250px',
  },
  {
    formatter: (row): React.JSX.Element => {
      const mapping = {
        pending: { label: 'Pending', icon: <ClockIcon color="var(--mui-palette-warning-main)" weight="fill" /> },
        success: { label: 'Success', icon: <CheckCircleIcon color="var(--mui-palette-success-main)" weight="fill" /> },
        failed: { label: 'Failed', icon: <XCircleIcon color="var(--mui-palette-error-main)" weight="fill" /> },
        rejected: { label: 'Rejected', icon: <MinusIcon color="var(--mui-palette-error-main)" /> },
      } as const;
      const { label, icon } = mapping[row.status as keyof typeof mapping]
        ?? { label: 'Unknown', icon: null };

      return <Chip icon={icon} label={label} size="small" variant="outlined" />;
    },
    name: 'Status',
    width: '120px',
  },
  {
    formatter: (row): React.JSX.Element => (
      <Typography variant="body2">{row.authMethod ? row.authMethod.toUpperCase() : 'Unknown'}</Typography>
    ),
    name: 'Auth Method',
    width: '150px',
  },
  // {
  //   formatter: (row): React.JSX.Element => (
  //     <Typography variant="body2">{row.matchField ? row.matchField.toUpperCase() : 'N/A'}</Typography>
  //   ),
  //   name: 'Matched Field',
  //   width: '150px',
  // },
  {
    formatter: (): React.JSX.Element => (
      <IconButton>
        <EyeIcon />
      </IconButton>
    ),
    name: 'Actions',
    hideName: true,
    width: '80px',
    align: 'right',
  },
] satisfies ColumnDef<SSHEvent>[];

export interface SSHEventsTableProps {
  rows: SSHEvent[];
}

export function SSHEventsTable({ rows }: SSHEventsTableProps): React.JSX.Element {
  return (
    <>
      <DataTable<SSHEvent> columns={columns} rows={rows} />
      {!rows.length ? (
        <Box sx={{ p: 3 }}>
          <Typography color="text.secondary" sx={{ textAlign: 'center' }} variant="body2">
            No SSH events found
          </Typography>
        </Box>
      ) : null}
    </>
  );
}
