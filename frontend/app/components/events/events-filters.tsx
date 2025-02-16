import * as React from 'react';
import { useNavigate } from 'react-router';
// import { useOrdersSelection } from './events-selection-context';
import { paths } from '~/lib/paths';
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
  Typography,
  type SelectChangeEvent
} from '@mui/material';
import { useEventStatsQuery } from 'actions/events';

export type SortDir = 'asc' | 'desc';

export interface Filters {
  customer?: string;
  id?: string;
  status?: string;
}

export interface OrdersFiltersProps {
  filters?: Filters;
  sortDir?: SortDir;
}

export function OrdersFilters({ filters = {}, sortDir = 'desc' }: OrdersFiltersProps): React.JSX.Element {
  const { data } = useEventStatsQuery();
  const allCount = typeof data?.total?.loginFailed === 'number'
    ? data!.total!.loginFailed + data!.total!.loginSuccess
    : 0;
  const tabs = [
    { label: 'All', value: '', count: allCount },
    { label: 'Success', value: 'success', count: data?.total?.loginSuccess ?? 0 },
    { label: 'Failed', value: 'failed', count: data?.total?.loginFailed ?? 0 },
  ];
  const { customer, id, status } = filters;

  const navigate = useNavigate();

  // const selection = useOrdersSelection();

  const updateSearchParams = React.useCallback(
    (newFilters: Filters, newSortDir: SortDir): void => {
      const searchParams = new URLSearchParams();

      if (newSortDir === 'asc') {
        searchParams.set('sortDir', newSortDir);
      }

      if (newFilters.status) {
        searchParams.set('status', newFilters.status);
      }

      if (newFilters.id) {
        searchParams.set('id', newFilters.id);
      }

      if (newFilters.customer) {
        searchParams.set('customer', newFilters.customer);
      }

      navigate(`${paths.events.list}?${searchParams.toString()}`);
    },
    [navigate]
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

  const handleCustomerChange = React.useCallback(
    (value?: string) => {
      updateSearchParams({ ...filters, customer: value }, sortDir);
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

  const hasFilters = status || id || customer;

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
            displayValue={customer}
            label="Customer"
            onFilterApply={(value) => {
              handleCustomerChange(value as string);
            }}
            onFilterDelete={() => {
              handleCustomerChange();
            }}
            popover={<CustomerFilterPopover />}
            value={customer}
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

function CustomerFilterPopover(): React.JSX.Element {
  const { anchorEl, onApply, onClose, open, value: initialValue } = useFilterContext();
  const [value, setValue] = React.useState<string>('');

  React.useEffect(() => {
    setValue((initialValue as string | undefined) ?? '');
  }, [initialValue]);

  return (
    <FilterPopover anchorEl={anchorEl} onClose={onClose} open={open} title="Filter by customer">
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
