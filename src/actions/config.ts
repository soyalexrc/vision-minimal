import type { SWRConfiguration } from 'swr';

import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type ConfigData = {
  data: {
    id: string;
    code: string;
    description?: string;
    value: string;
  };
};

export function useGetConfig(id: string) {
  const url = endpoints.config.byId + '/' + id;

  const { data, isLoading, error, isValidating } = useSWR<ConfigData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      config: data?.data,
      configLoading: isLoading,
      configError: error,
      configValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
