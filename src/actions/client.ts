import type { SWRConfiguration } from 'swr';
import type { IProductItem } from 'src/types/product';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { fetcher, endpoints } from 'src/lib/axios';

import type { IClientItem } from '../types/client';
import { AllyQuickEditSchemaType } from '../sections/ally/ally-quick-edit-form';
import axios from '../lib/axios';
import { ClientFormSchemaType } from '../sections/client/form/create-update-client-form';

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
