import { useQuery } from '@tanstack/react-query';
import { appConfig } from '~/config/app-config';

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
  event_type: string;
  username: string;
  ip_address: string;
  status: string;
  raw_message: string;
  created_at: number;
  auth_method: string;
  hostname: string;
  match_field: string;
}

interface SearchResult extends SSHEvent {
  match_type: 'username' | 'hostname' | 'ipAddress';
}

interface SearchResults {
  events: SearchResult[];
  query: string;
  limit: number;
  offset: number;
}


export const eventsKeys = {
  pagination: (page: string) => ['events', 'pagination', page],
  search: (query: string) => ['events', 'search', query],
  stats: ['events', 'stats'],
};

const baseUrl = typeof window === 'undefined' ? '' : window?.ENV?.API_BASE_URL

export const useEventsPaginationQuery = (page: string = '0') => {
  return useQuery({
    queryKey: eventsKeys.pagination(page),
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/api/log-events?page=${page}`);
      return response.json();
    },
  });
};

export const useEventsSearchQuery = (query: string) => {
  return useQuery({
    queryKey: eventsKeys.search(query),
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/api/log-events/search?q=${query}`);
      return response.json() as Promise<SearchResults>;
    },
  });
};

export const useEventStatsQuery = () => {
  return useQuery({
    queryKey: eventsKeys.stats,
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/api/log-events/stats`);
      return response.json() as Promise<EventsStats>;
    },
  });
}
