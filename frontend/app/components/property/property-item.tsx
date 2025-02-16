import { Box, Typography } from '@mui/material';
import * as React from 'react';


export interface PropertyItemProps {
  name: string;
  value: string | React.ReactNode;
}

export function PropertyItem({ name, value }: PropertyItemProps): React.JSX.Element {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'grid',
        gridGap: 'var(--PropertyItem-gap, 8px)',
        gridTemplateColumns: 'var(--PropertyItem-columns)',
        p: 'var(--PropertyItem-padding, 8px)',
      }}
    >
      <div>
        <Typography color="text.secondary" variant="body2">
          {name}
        </Typography>
      </div>
      <div>
        {typeof value === 'string' ? (
          <Typography color={value ? 'text.primary' : 'text.secondary'} variant="subtitle2">
            {value || 'None'}
          </Typography>
        ) : (
          <React.Fragment>{value}</React.Fragment>
        )}
      </div>
    </Box>
  );
}
