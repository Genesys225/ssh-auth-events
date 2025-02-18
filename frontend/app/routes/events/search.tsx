import { useSearchParams, type LoaderFunctionArgs } from 'react-router';
import { appConfig } from '~/config/app-config';
import { SSHEventsTable } from '~/components/events/events-table';
import { Box, Card, Divider, Stack, Typography } from '@mui/material';
import { OrdersFilters, type Filters } from '~/components/events/events-filters';
import { OrdersPagination } from '~/components/events/eventspagination';
import { OrderModal } from '~/components/events/event-modal';
import {
  useEventsSearchQuery,
  type SearchResults,
  type SSHEvent,
} from 'actions/events';
import { getApiBaseUrl } from '~/lib/get-api-url';
import type { Route } from './+types/search';


export const meta = () => [{ title: `List | Events | ${appConfig.site.name}` }];

export async function loader(context: LoaderFunctionArgs) {
  const baseUrl = getApiBaseUrl();
  const { searchParams } = new URL(context.request.url);
  const page = searchParams.get('page') ?? '0';
  const rowsPerPage = searchParams.get('rowsPerPage') ?? '25';
  const limit = Number(rowsPerPage);
  const offset = Number(page) * limit;
  const apiSearchParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    q: searchParams.get('q') || '',
  }).toString();
  const response = await fetch(`${baseUrl}/api/log-events/search?${apiSearchParams}`);
  const data = await response.json() as SearchResults;
  return data;
}


export default function Page({ loaderData }: Route.ComponentProps): React.JSX.Element {
  const { ipAddress, id, previewId, sortDir, status, hostname, username } = useExtractSearchParams();
  const { data } = useEventsSearchQuery({ serverData: loaderData });
  const events = loaderData?.results || [];
  const sortedEvents = applySort(events, sortDir);
  const filteredOrders = applyFilters(sortedEvents, { ipAddress, id, status, hostname, username });

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
              <Typography variant="h4">Search results</Typography>
            </Box>
            {/* <div>
              <Button startIcon={<PlusIcon />} variant="contained">
                Add
              </Button>
            </div> */}
          </Stack>
          {/* <OrdersSelectionProvider orders={filteredOrders}> */}
            <Card>
              <OrdersFilters sortDir={sortDir} />
              <Divider />
              <Box sx={{ overflowX: 'auto' }}>
                <SSHEventsTable rows={filteredOrders} />
              </Box>
              <Divider />
              <OrdersPagination count={filteredOrders.length} />
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
 