import type { SWRConfiguration } from 'swr';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

import type { IServiceItem, ISubServiceItem } from '../types/service';
import type { AllyQuickEditSchemaType } from '../sections/ally/ally-quick-edit-form';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type ServicesData = {
  data: IServiceItem[];
  total: number;
}

export function useGetServices() {
  const url = endpoints.service.list;

  const { data, isLoading, error, isValidating } = useSWR<ServicesData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      services: data?.data || [],
      servicesLoading: isLoading,
      servicesError: error,
      servicesValidating: isValidating,
      servicesEmpty: !isLoading && !isValidating && !data?.data?.length,
      count: data?.total || 0,
      refetch: () => mutate(url),
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

type SubServicesData = {
  data: ISubServiceItem[];
}

export function useGetSubServices() {
  const url = endpoints.subService.list;

  const { data, isLoading, error, isValidating } = useSWR<SubServicesData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      subServices: data?.data || [],
      subServicesLoading: isLoading,
      subServicesError: error,
      subServicesValidating: isValidating,
      subServicesEmpty: !isLoading && !isValidating && !data?.data?.length,
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
  const url = `${endpoints.ally.delete}/remove-many`;
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

