import * as React from 'react';
import { useSearchParams } from 'react-router';
// import { useOrdersSelection } from './events-selection-context';
import { Option } from '../option';
import { FilterButton, FilterPopover, useFilterContext } from '../filter-button';
import {
  Chip,
  Button,
  Divider,
  FormControl,
  OutlinedInput,
  Select,
  Stack,
  Tab,
  Tabs,
  type SelectChangeEvent
} from '@mui/material';
import { useEventStatsQuery } from 'actions/events';

export type SortDir = 'asc' | 'desc';

export interface Filters {
  ipAddress?: string;
  username?: string;
  hostname?: string;
  id?: string;
  status?: string;
}

export interface OrdersFiltersProps {
  sortDir?: SortDir;
}

export function OrdersFilters({ sortDir = 'desc' }: OrdersFiltersProps): React.JSX.Element {
  const { data } = useEventStatsQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const allCount = typeof data?.total?.loginFailed === 'number'
    ? data!.total!.loginFailed + data!.total!.loginSuccess
    : 0;
  const tabs = [
    { label: 'All', value: '', count: allCount },
    { label: 'Success', value: 'success', count: data?.total?.loginSuccess ?? 0 },
    { label: 'Failed', value: 'failed', count: data?.total?.loginFailed ?? 0 },
  ];

  const filters = Array.from(searchParams.keys()).reduce((acc, key) => {
    acc[key as keyof Filters] = searchParams.get(key)!;
    return acc;
  }, {} as Filters);

  const { status, id, ipAddress, hostname, username } = filters;
  // const selection = useOrdersSelection();

  const updateSearchParams = React.useCallback(
    (newFilters: Filters, newSortDir: SortDir): void => {

      if (newSortDir === 'asc') {
        searchParams.set('sortDir', newSortDir);
      } else if (newSortDir) {
        searchParams.delete('sortDir');
      }

      if (newFilters.status === 'success' || newFilters.status === 'failed') {
        searchParams.set('status', newFilters.status);
      } else if (newFilters.status === '') {
        searchParams.delete('status');
      }

      if (newFilters.id) {
        searchParams.set('id', newFilters.id);
      } else if (newFilters.id === '') {
        searchParams.delete('id');
      }

      if (newFilters.ipAddress) {
        searchParams.set('ipAddress', newFilters.ipAddress);
      } else if (newFilters.ipAddress === '') {
        searchParams.delete('ipAddress');
      }

      if (newFilters.username) {
        searchParams.set('username', newFilters.username);
      } else if (newFilters.username === '') {
        searchParams.delete('username');
      }

      if (newFilters.hostname) {
        searchParams.set('hostname', newFilters.hostname);
      } else if (newFilters.hostname === '') {
        searchParams.delete('hostname');
      }

      if (Object.keys(newFilters).length === 0) {
        searchParams.delete('status');
        searchParams.delete('id');
        searchParams.delete('ipAddress');
        searchParams.delete('username');
        searchParams.delete('hostname');
      }

      setSearchParams(searchParams);
    },
    [setSearchParams]
  );

  const handleClearFilters = React.useCallback(() => {
    updateSearchParams({}, sortDir);
  }, [updateSearchParams, sortDir]);

  const handleStatusChange = React.useCallback(
    (_: React.SyntheticEvent, value: string) => {
      updateSearchParams({ ...filters, status: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleIpAddressChange = React.useCallback(
    (value?: string) => {
      updateSearchParams({ ...filters, ipAddress: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleHostnameChange = React.useCallback(
    (value?: string) => {
      updateSearchParams({ ...filters, hostname: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleUsernameChange = React.useCallback(
    (value?: string) => {
      updateSearchParams({ ...filters, username: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleIdChange = React.useCallback(
    (value?: string) => {
      updateSearchParams({ ...filters, id: value }, sortDir);
    },
    [updateSearchParams, filters, sortDir]
  );

  const handleSortChange = React.useCallback(
    (event: SelectChangeEvent) => {
      updateSearchParams(filters, event.target.value as SortDir);
    },
    [updateSearchParams, filters]
  );

  const hasFilters = status || id || ipAddress || hostname || username;

  return (
    <div>
      <Tabs onChange={handleStatusChange} sx={{ px: 3 }} value={status ?? ''} variant="scrollable">
        {tabs.map((tab) => (
          <Tab // @ts-ignore
            icon={<Chip label={tab.count} size="small" variant="soft" />}
            iconPosition="end"
            key={tab.value}
            label={tab.label}
            sx={{ minHeight: 'auto' }}
            tabIndex={0}
            value={tab.value}
          />
        ))}
      </Tabs>
      <Divider />
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flex: '1 1 auto', flexWrap: 'wrap' }}>
          <FilterButton
            displayValue={id}
            label="Login ID"
            onFilterApply={(value) => {
              handleIdChange(value as string);
            }}
            onFilterDelete={() => {
              handleIdChange();
            }}
            popover={<IdFilterPopover />}
            value={id}
          />
          <FilterButton
            displayValue={ipAddress}
            label="IP Address"
            onFilterApply={(value) => {
              handleIpAddressChange(value as string);
            }}
            onFilterDelete={() => {
              handleIpAddressChange();
            }}
            popover={<IpAddressFilterPopover />}
            value={ipAddress}
          />
          <FilterButton
            displayValue={hostname}
            label="Hostname"
            onFilterApply={(value) => {
              handleHostnameChange(value as string);
            }}
            onFilterDelete={() => {
              handleHostnameChange();
            }}
            popover={<HostnameFilterPopover />}
            value={ipAddress}
          />
          <FilterButton
            displayValue={username}
            label="Username"
            onFilterApply={(value) => {
              handleUsernameChange(value as string);
            }}
            onFilterDelete={() => {
              handleUsernameChange();
            }}
            popover={<UsernameFilterPopover />}
            value={ipAddress}
          />
          {hasFilters ? <Button onClick={handleClearFilters}>Clear filters</Button> : null}
        </Stack>
        {/* {selection.selectedAny ? (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography color="text.secondary" variant="body2">
              {selection.selected.size} selected
            </Typography>
            <Button color="error" variant="contained">
              Delete
            </Button>
          </Stack>
        ) : null} */}
        <Select name="sort" onChange={handleSortChange} sx={{ maxWidth: '100%', width: '120px' }} value={sortDir}>
          <Option value="desc">Newest</Option>
          <Option value="asc">Oldest</Option>
        </Select>
      </Stack>
    </div>
  );
}

function IpAddressFilterPopover(): React.JSX.Element {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = React.useState<string>('');

  React.useEffect(() => {
    setValue((initialValue as string | undefined) ?? '');
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by ip address">
      <FormControl>
        <OutlinedInput
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onApply(value);
            }
          }}
          value={value}
        />
      </FormControl>
      <Button
        onClick={() => {
          onApply(value);
        }}
        variant="contained"
      >
        Apply
      </Button>
    </FilterPopover>
  );
}

function HostnameFilterPopover(): React.JSX.Element {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = React.useState<string>('');

  React.useEffect(() => {
    setValue((initialValue as string | undefined) ?? '');
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by hostname">
      <FormControl>
        <OutlinedInput
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onApply(value);
            }
          }}
          value={value}
        />
      </FormControl>
      <Button
        onClick={() => {
          onApply(value);
        }}
        variant="contained"
      >
        Apply
      </Button>
    </FilterPopover>
  );
}

function UsernameFilterPopover(): React.JSX.Element {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = React.useState<string>('');

  React.useEffect(() => {
    setValue((initialValue as string | undefined) ?? '');
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by username">
      <FormControl>
        <OutlinedInput
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onApply(value);
            }
          }}
          value={value}
        />
      </FormControl>
      <Button
        onClick={() => {
          onApply(value);
        }}
        variant="contained"
      >
        Apply
      </Button>
    </FilterPopover>
  );
}

function IdFilterPopover(): React.JSX.Element {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = React.useState<string>('');

  React.useEffect(() => {
    setValue((initialValue as string | undefined) ?? '');
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by ID">
      <FormControl>
        <OutlinedInput
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              onApply(value);
            }
          }}
          value={value}
        />
      </FormControl>
      <Button
        onClick={() => {
          onApply(value);
        }}
        variant="contained"
      >
        Apply
      </Button>
    </FilterPopover>
  );
}
