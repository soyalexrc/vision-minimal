import type { SWRConfiguration } from 'swr';
import type { IProductItem } from 'src/types/product';

import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';
import { IAllyItem } from '../types/ally';
import axios from 'src/lib/axios';
import { AllyQuickEditSchemaType } from '../sections/ally/ally-quick-edit-form';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type AlliesData = {
  data: IAllyItem[];
  total: number;
}

export function useGetAllies() {
  const url = endpoints.ally.list;

  const { data, isLoading, error, isValidating } = useSWR<AlliesData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      allies: data?.data || [],
      alliesLoading: isLoading,
      alliesError: error,
      alliesValidating: isValidating,
      alliesEmpty: !isLoading && !isValidating && !data?.data?.length,
      count: data?.total || 0,
      refetch: () => mutate(url),
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type ProductData = {
  product: IProductItem;
};

export function useGetProduct(productId: string) {
  const url = productId ? [endpoints.product.details, { params: { productId } }] : '';

  const { data, isLoading, error, isValidating } = useSWR<ProductData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      product: data?.product,
      productLoading: isLoading,
      productError: error,
      productValidating: isValidating,
    }),
    [data?.product, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type SearchResultsData = {
  results: IProductItem[];
};

export function useSearchProducts(query: string) {
  const url = query ? [endpoints.product.search, { params: { query } }] : '';

  const { data, isLoading, error, isValidating } = useSWR<SearchResultsData>(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      searchResults: data?.results || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !data?.results.length,
    }),
    [data?.results, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function deleteAlly(id: number) {
  const url = `${endpoints.ally.delete}/${id}`;
  return axios.delete(url);
}

export async function deleteManyAllies(ids: number[]) {
  const url = `${endpoints.ally.delete}/many`;
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

