import type { SWRConfiguration } from 'swr';
import type { IProductItem } from 'src/types/product';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

import type { IClientItem } from '../types/client';
import type { ClientFormSchemaType } from '../sections/client/form/create-update-client-form';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type ClientsData = {
  data: IClientItem[];
  total: number;
}

type ClientData = {
  data: IClientItem;
}

export function useGetClients() {
  const url = endpoints.client.list;

  const { data, isLoading, error, isValidating } = useSWR<ClientsData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      clients: data?.data || [],
      clientsLoading: isLoading,
      clientsError: error,
      clientsValidating: isValidating,
      clientsEmpty: !isLoading && !isValidating && !data?.data?.length,
      count: data?.total || 0,
      refresh: () => mutate(url)
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetClient(id?: number | string) {
  const url = id ? `${endpoints.client.edit}/${id}` : null;

  const { data, isLoading, error, isValidating } = useSWR<ClientData>(
    url,
    url ? fetcher : null,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      client: data?.data || {},
      clientLoading: isLoading,
      clientError: error,
      clientValidating: isValidating,
      clientEmpty: !isLoading && !isValidating && !data?.data,
      refresh: () => url && mutate(url)
    }),
    [data?.data, error, isLoading, isValidating, url]
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

export async function createClient(payload: ClientFormSchemaType) {
  const url = `${endpoints.client.create}`;
  return axios.post(url, payload);
}

export async function updateClient(payload: ClientFormSchemaType, id: number) {
  const url = `${endpoints.client.edit}/${id}`;
  return axios.patch(url, payload);
}

export async function changeClientStatus(id: number, statusTo: string) {
  const url = `${endpoints.client.editStatus}/${id}`;
  return axios.patch(url, { status: statusTo });
}

export async function deleteManyClients(ids: number[]) {
  const url = `${endpoints.client.delete}/remove-many`;
  return axios.post(url, { ids });
}

export async function deleteClient(id: number) {
  const url = `${endpoints.client.delete}/${id}`;
  return axios.delete(url);
}

export async function restoreClient(id: number) {
  const url = `${endpoints.client.restore}`;
  return axios.post(url, { id });
}
