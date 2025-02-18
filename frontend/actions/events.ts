import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { appConfig } from '~/config/app-config';
import { getApiBaseUrl } from '~/lib/get-api-url';

interface EventsStats {
  total: {
    loginSuccess: number;
    loginFailed: number;
  };
  userStats: {
    username: string;
    total: number;
    failed: number;
    success: number;
  }[];
}

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

interface SearchResult extends SSHEvent {
  matchType: 'username' | 'hostname' | 'ipAddress';
}

export interface SearchResults {
  results: SearchResult[];
  limit: number;
  offset: number;
}

export interface PaginatedEvents {
  events: SSHEvent[];
  total: number;
  limit: number;
  offset: number;
}

export const eventsKeys = {
  pagination: (limit: number, offset: number) => [
    'events',
    'pagination',
    limit,
    offset,
  ],
  search: (query: string) => ['events', 'search', query],
  stats: ['events', 'stats'],
};

interface EventsPaginationQuery {
  page?: string;
  serverData?: PaginatedEvents;
}

export const useEventsPaginationQuery = ({
  page = '0',
  serverData,
}: EventsPaginationQuery = {}) => {
  const baseUrl = getApiBaseUrl();
  const [searchParams] = useSearchParams();
  const rowsPerPage = searchParams.get('rowsPerPage') ?? 25;
  const limit = Number(rowsPerPage);
  const offset = Number(page) * limit;

  return useQuery({
    queryKey: eventsKeys.pagination(limit, offset),
    queryFn: async () => {
      const response = await fetch(
        `${baseUrl}/api/log-events?limit=${limit}&offset=${offset}`
      );
      return response.json() as Promise<PaginatedEvents>;
    },
    initialData: serverData,
  });
};

export const useEventsSearchQuery = ({ serverData }: { serverData?: SearchResults; }) => {
  const baseUrl = getApiBaseUrl();
  const [searchParams] = useSearchParams();
  const rowsPerPage = searchParams.get('rowsPerPage') ?? 25;
  const page = searchParams.get('page') ?? '0';
  const limit = Number(rowsPerPage);
  const offset = Number(page) * limit;
  const apiSearchParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
    q: searchParams.get('q') || '',
  }).toString();
  return useQuery({
    queryKey: eventsKeys.search(apiSearchParams),
    queryFn: async () => {
      const response = await fetch(
        `${baseUrl}/api/log-events/search?${apiSearchParams}`
      );
      return response.json() as Promise<SearchResults>;
    },
    initialData: serverData,
  });
};

export const useEventStatsQuery = () => {
  const baseUrl = getApiBaseUrl();
  return useQuery({
    queryKey: eventsKeys.stats,
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/api/log-events/stats`);
      return response.json() as Promise<EventsStats>;
    },
  });
};
