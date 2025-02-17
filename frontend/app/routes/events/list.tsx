import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { useSearchParams } from 'react-router';
import { appConfig } from '~/config/app-config';
import dayjs from 'dayjs';
import { SSHEventsTable } from '~/components/events/events-table';
import { Box, Button, Card, Divider, Stack, Typography } from '@mui/material';
// import { OrdersSelectionProvider } from '~/components/events/events-selection-context';
import { OrdersFilters, type Filters } from '~/components/events/events-filters';
import { OrdersPagination } from '~/components/events/eventspagination';
import { OrderModal } from '~/components/events/event-modal';
import { useEventsPaginationQuery, type SSHEvent } from 'actions/events';


export const meta = () => [{ title: `List | Events | ${appConfig.site.name}` }];


export default function Page(): React.JSX.Element {
  const { ipAddress, id, previewId, sortDir, status, hostname, username } = useExtractSearchParams();
  const { data } = useEventsPaginationQuery();
  const orders = data?.events || [];
  const sortedOrders = applySort(orders, sortDir);
  const filteredOrders = applyFilters(sortedOrders, { ipAddress, id, status, hostname, username });

  return (
    <>
      <Box
        sx={{
          maxWidth: 'var(--Content-maxWidth)',
          m: 'var(--Content-margin)',
          p: 'var(--Content-padding)',
          width: 'var(--Content-width)',
        }}
      >
        <Stack spacing={4}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
            <Box sx={{ flex: '1 1 auto' }}>
              <Typography variant="h4">Orders</Typography>
            </Box>
            <div>
              <Button startIcon={<PlusIcon />} variant="contained">
                Add
              </Button>
            </div>
          </Stack>
          {/* <OrdersSelectionProvider orders={filteredOrders}> */}
            <Card>
              <OrdersFilters filters={{ ipAddress, id, status, hostname, username }} sortDir={sortDir} />
              <Divider />
              <Box sx={{ overflowX: 'auto' }}>
                <SSHEventsTable rows={filteredOrders} />
              </Box>
              <Divider />
              <OrdersPagination count={filteredOrders.length} page={0} />
            </Card>
          {/* </OrdersSelectionProvider> */}
        </Stack>
      </Box>
      <OrderModal open={Boolean(previewId)} />
    </>
  );
}

function useExtractSearchParams(): {
  ipAddress?: string;
  id?: string;
  hostname?: string;
  username?: string;
  previewId?: string;
  sortDir?: 'asc' | 'desc';
  status?: string;
} {
  const [searchParams] = useSearchParams();

  return {
    ipAddress: searchParams.get('ipAddress') || undefined,
    hostname: searchParams.get('hostname') || undefined,
    username: searchParams.get('username') || undefined,
    id: searchParams.get('id') || undefined,
    previewId: searchParams.get('previewId') || undefined,
    sortDir: (searchParams.get('sortDir') || undefined) as 'asc' | 'desc' | undefined,
    status: searchParams.get('status') || undefined,
  };
}

// Sorting and filtering has to be done on the server.

function applySort(row: SSHEvent[], sortDir: 'asc' | 'desc' | undefined): SSHEvent[] {
  return row.sort((a, b) => {
    if (sortDir === 'asc') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    }

    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  });
}

function applyFilters(row: SSHEvent[], { ipAddress, username, hostname, id, status }: Filters): SSHEvent[] {
  return row.filter((item) => {
    if (ipAddress) {
      if (!item.ipAddress.toLowerCase().includes(ipAddress.toLowerCase())) {
        return false;
      }
    }

    if (username) {
      if (!item.username.toLowerCase().includes(username.toLowerCase())) {
        return false;
      }
    }

    if (hostname) {
      if (!item.hostname.toLowerCase().includes(hostname.toLowerCase())) {
        return false;
      }
    }

    if (id) {
      if (!item.id.toString().includes(id)) {
        return false;
      }
    }

    if (status) {
      if (item.status !== status) {
        return false;
      }
    }

    return true;
  });
}
