import type { SWRConfiguration } from 'swr';
import type { IProductItem } from 'src/types/product';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

import type { AllyQuickEditSchemaType } from '../sections/ally/ally-quick-edit-form';
import type {
  IEntity, ICurrency,
  IWayToPay,
  ICashFlowItem,
  IPersonCashFlow,
  ITransactionType,
  IPropertyCashFlow,
} from '../types/cashflow';
import { CashFlowSchemaType } from 'src/sections/cashflow/form/create-update-cashflow-form';
import { UploadService } from 'src/utils/files/upload';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type CashFlowData = {
  data: ICashFlowItem[];
}

export function useGetCashFlows() {
  const url = endpoints.cashflow.list;

  const { data, isLoading, error, isValidating } = useSWR<CashFlowData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      cashflow: data?.data || [],
      cashflowLoading: isLoading,
      cashflowError: error,
      cashflowValidating: isValidating,
      cashflowEmpty: !isLoading && !isValidating && !data?.data?.length,
      refetch: () => mutate(url),
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}


// ----------------------------------------------------------------------

type PeopleCashFlowData = {
  data: IPersonCashFlow[];
}

export function useGetCashFlowPeople() {
  const url = endpoints.cashflow.people;

  const { data, isLoading, error, isValidating } = useSWR<PeopleCashFlowData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      cashflowPeople: data?.data || [],
      cashflowPeopleLoading: isLoading,
      cashflowPeopleError: error,
      cashflowPeopleValidating: isValidating,
      cashflowPeopleEmpty: !isLoading && !isValidating && !data?.data?.length,
      refetch: () => mutate(url),
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}


// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

type TransactionTypesData = {
  data: ITransactionType[];
}

export function useGetCashFlowTransactionTypes() {
  const url = endpoints.cashflow.transactionTypes;

  const { data, isLoading, error, isValidating } = useSWR<TransactionTypesData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      transactionTypes: data?.data || [],
      transactionTypesLoading: isLoading,
      transactionTypesError: error,
      transactionTypesValidating: isValidating,
      transactionTypesEmpty: !isLoading && !isValidating && !data?.data?.length,
      refetch: () => mutate(url),
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}


// ----------------------------------------------------------------------


type WaysToPayData = {
  data: IWayToPay[];
}

export function useGetCashFlowWaysToPay() {
  const url = endpoints.cashflow.waysToPay;

  const { data, isLoading, error, isValidating } = useSWR<WaysToPayData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      waysToPay: data?.data || [],
      waysToPayLoading: isLoading,
      waysToPayError: error,
      waysToPayValidating: isValidating,
      waysToPayEmpty: !isLoading && !isValidating && !data?.data?.length,
      refetch: () => mutate(url),
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}


// ----------------------------------------------------------------------

// ----------------------------------------------------------------------


type CurrenciesData = {
  data: ICurrency[];
}

export function useGetCashFlowCurrencies() {
  const url = endpoints.cashflow.currencies;

  const { data, isLoading, error, isValidating } = useSWR<CurrenciesData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      currencies: data?.data || [],
      currenciesLoading: isLoading,
      currenciesError: error,
      currenciesValidating: isValidating,
      currenciesEmpty: !isLoading && !isValidating && !data?.data?.length,
      refetch: () => mutate(url),
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}


// ----------------------------------------------------------------------

type EntitiesData = {
  data: IEntity[];
}

export function useGetCashFlowEntities() {
  const url = endpoints.cashflow.entities;

  const { data, isLoading, error, isValidating } = useSWR<EntitiesData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      entities: data?.data || [],
      entitiesLoading: isLoading,
      entitiesError: error,
      entitiesValidating: isValidating,
      entitiesEmpty: !isLoading && !isValidating && !data?.data?.length,
      refetch: () => mutate(url),
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}


// ----------------------------------------------------------------------

type PropertyCashFlowData = {
  data: IPropertyCashFlow[];
}

export function useGetCashFlowProperties() {
  const url = endpoints.cashflow.properties;

  const { data, isLoading, error, isValidating } = useSWR<PropertyCashFlowData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      cashflowProperties: data?.data || [],
      cashflowPropertiesLoading: isLoading,
      cashflowPropertiesError: error,
      cashflowPropertiesValidating: isValidating,
      cashflowPropertiesEmpty: !isLoading && !isValidating && !data?.data?.length,
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


export async function createCashFlow(payload: CashFlowSchemaType, createdBy: any) {
    const attachmentsUploaded = payload.attachments.filter((image: any) => typeof image === 'string' && image.startsWith('http'));
    const attachmentsToUpload = payload.attachments.filter((image: any) => typeof image === 'object' && image instanceof File);
  
    if (attachmentsToUpload.length > 0) {
      const newAttachments  = await UploadService.uploadMultiple(attachmentsToUpload, 'cashflow');
      payload.attachments = [...attachmentsUploaded, ...newAttachments.urls];
      console.log('newAttachments', newAttachments);
    }
  const url = `${endpoints.cashflow.create}`;
  return axios.post(url, {...payload, createdBy});
}

export async function updateCashFlow(payload: CashFlowSchemaType, updatedby: any, id: number) {
    const attachmentsUploaded = payload.attachments.filter((image: any) => typeof image === 'string' && image.startsWith('http'));
    const attachmentsToUpload = payload.attachments.filter((image: any) => typeof image === 'object' && image instanceof File);
  
    if (attachmentsToUpload.length > 0) {
      const newAttachments  = await UploadService.uploadMultiple(attachmentsToUpload, 'cashflow');
      payload.attachments = [...attachmentsUploaded, ...newAttachments.urls];
      console.log('newAttachments', newAttachments);
    }
  const url = `${endpoints.cashflow.edit}`;
  return axios.put(`${url}/${id}`, {...payload, updatedby});
}

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

