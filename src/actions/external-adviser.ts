import { mutate, SWRConfiguration } from 'swr';
import type { IProductItem } from 'src/types/product';

import useSWR from 'swr';
import { useMemo } from 'react';

import { fetcher, endpoints } from 'src/lib/axios';
import { IExternalAdviserItem } from '../types/external-adviser';
import axios from '../lib/axios';
import { AllyQuickEditSchemaType } from '../sections/ally/ally-quick-edit-form';
import { ExternalAdviserQuickEditSchemaType } from '../sections/external-adviser/external-adviser-quick-edit-form';


// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type ExternalAdvisersData = {
  data: IExternalAdviserItem[];
  total: number;
}

export function useGetExternalAdvisers() {
  const url = endpoints.externalAdviser.list;

  const { data, isLoading, error, isValidating } = useSWR<ExternalAdvisersData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      advisers: data?.data || [],
      advisersLoading: isLoading,
      advisersError: error,
      advisersValidating: isValidating,
      advisersEmpty: !isLoading && !isValidating && !data?.data?.length,
      count: data?.total || 0,
      refetch: () => mutate(url)
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

export async function deleteExternalAdviser(id: number) {
  const url = `${endpoints.externalAdviser.delete}/${id}`;
  return axios.delete(url);
}

export async function deleteManyExternalAdvisers(ids: number[]) {
  const url = `${endpoints.externalAdviser.delete}/delete/many`;
  return axios.post(url, { ids });
}

export async function createExternalAdviser(payload: ExternalAdviserQuickEditSchemaType) {
  const url = `${endpoints.externalAdviser.create}`;
  return axios.post(url, payload);
}

export async function updateExternalAdviser(payload: ExternalAdviserQuickEditSchemaType, id: number) {
  const url = `${endpoints.externalAdviser.edit}/${id}`;
  return axios.patch(url, payload);
}

export async function restoreExternalAdviser(id: number) {
  const url = `${endpoints.externalAdviser.restore}`;
  return axios.post(url, { id });
}


