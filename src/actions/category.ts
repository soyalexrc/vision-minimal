import type { SWRConfiguration } from 'swr';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

import type { ICategoryItem } from '../types/category';
import type { AllyQuickEditSchemaType } from '../sections/ally/ally-quick-edit-form';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type CategoriesData = {
  data: ICategoryItem[];
  total: number;
}

export function useGetCategories() {
  const url = endpoints.category.list;

  const { data, isLoading, error, isValidating } = useSWR<CategoriesData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      categories: data?.data || [],
      categoriesLoading: isLoading,
      categoriesError: error,
      categoriesValidating: isValidating,
      categoriesEmpty: !isLoading && !isValidating && !data?.data?.length,
      count: data?.total || 0,
      refetch: () => mutate(url),
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function deleteAlly(id: number) {
  const url = `${endpoints.ally.delete}/${id}`;
  return axios.delete(url);
}

export async function deleteManyAllies(ids: number[]) {
  const url = `${endpoints.ally.delete}/delete/many`;
  return axios.post(url, { ids });
}

export async function createAlly(payload: AllyQuickEditSchemaType) {
  const url = `${endpoints.ally.create}`;
  return axios.post(url, payload);
}

export async function updateAlly(payload: AllyQuickEditSchemaType, id: number) {
  const url = `${endpoints.ally.edit}/${id}`;
  return axios.patch(url, payload);
}

export async function restoreAlly(id: number) {
  const url = `${endpoints.ally.restore}`;
  return axios.post(url, { id });
}

