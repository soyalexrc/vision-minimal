import type { SWRConfiguration } from 'swr';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

import type { IUserItem } from '../types/user';
import type { UserQuickEditSchemaType } from '../sections/user/user-quick-edit-form';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type UsersData = {
  data: IUserItem[];
  total: number;
}

export function useGetUsers() {
  const url = endpoints.user.list;

  const { data, isLoading, error, isValidating } = useSWR<UsersData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      users: data?.data || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !isValidating && !data?.data?.length,
      count: data?.total || 0,
      refresh: () => mutate(url)
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}


export async function createUser(payload: UserQuickEditSchemaType) {
  const url = `${endpoints.user.create}`;
  return axios.post(url, payload);
}

export async function updateUser(payload: UserQuickEditSchemaType, id: number) {
  const url = `${endpoints.user.edit}/${id}`;
  return axios.patch(url, payload);
}
