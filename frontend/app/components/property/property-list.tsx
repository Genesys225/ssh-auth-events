import * as React from 'react';
import type { SxProps } from '@mui/system';
import { Stack } from '@mui/material';

export interface PropertyListProps {
  children: React.ReactNode;
  divider?: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  stripe?: 'even' | 'odd';
  sx?: SxProps;
}

export function PropertyList({
  children,
  divider,
  orientation = 'horizontal',
  stripe,
  sx,
}: PropertyListProps): React.JSX.Element {
  return (
    <Stack
      divider={divider}
      sx={{
        '--PropertyItem-columns': orientation === 'horizontal' ? '150px minmax(0, 1fr)' : '1fr',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--PropertyList-gap)',
        ...(stripe && { [`& > *:nth-child(${stripe})`]: { bgcolor: 'var(--mui-palette-background-level1)' } }),
        ...sx,
      }}
    >
      {children}
    </Stack>
  );
}
