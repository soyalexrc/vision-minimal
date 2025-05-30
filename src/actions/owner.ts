import type { SWRConfiguration } from 'swr';
import type { IProductItem } from 'src/types/product';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

import type { IOwnerItem } from '../types/owner';
import type { OwnerQuickEditSchemaType } from '../sections/owner/owner-quick-edit-form';


// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type Ownersdata = {
  data: IOwnerItem[];
  total: number;
}

export function useGetOwners() {
  const url = endpoints.owner.list;

  const { data, isLoading, error, isValidating } = useSWR<Ownersdata>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      owners: data?.data || [],
      ownersLoading: isLoading,
      ownersError: error,
      ownersValidating: isValidating,
      ownersEmpty: !isLoading && !isValidating && !data?.data?.length,
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

export async function deleteOwner(id: number) {
  const url = `${endpoints.owner.delete}/${id}`;
  return axios.delete(url);
}

export async function deleteManyOwners(ids: number[]) {
  const url = `${endpoints.owner.delete}/delete/many`;
  return axios.post(url, { ids });
}

export async function createOwner(payload: OwnerQuickEditSchemaType) {
  const url = `${endpoints.owner.create}`;
  return axios.post(url, payload);
}

export async function updateOwner(payload: OwnerQuickEditSchemaType, id: number) {
  const url = `${endpoints.owner.edit}/${id}`;
  return axios.patch(url, payload);
}

export async function restoreOwner(id: number) {
  const url = `${endpoints.owner.restore}`;
  return axios.post(url, { id });
}

