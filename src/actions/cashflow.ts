import type { AxiosResponse } from 'axios';
import type { SWRConfiguration } from 'swr';
import type { IProductItem } from 'src/types/product';
import type { DateFilters } from 'src/sections/cashflow/view/cashflow-list-view';
import type {
  CashFlowSchemaType,
  ExternalPersonSchemaType, ExternalPropertySchemaType,
} from 'src/sections/cashflow/form/create-cashflow-form';

import { format } from 'date-fns';
import useSWR, { mutate } from 'swr';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { UploadService } from 'src/utils/files/upload';

import axios, { fetcher, endpoints } from 'src/lib/axios';

import type { AllyQuickEditSchemaType } from '../sections/ally/ally-quick-edit-form';
import type {
  IEntity, ICurrency,
  IWayToPay,
  ICashFlowItem,
  IPersonCashFlow,
  ITransactionType,
  IPropertyCashFlow, ISimpleCashFlowData, ISimpleCashFlowPaymentData,
} from '../types/cashflow';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

export type CashFlowData = {
  data: ICashFlowItem[];
}

export type GetOneCashFlowData = {
  cashflow: ISimpleCashFlowData;
  payments: ISimpleCashFlowPaymentData[];
}

interface CashFlowParams extends DateFilters {
  [key: string]: any;
}

interface CashFlowState {
  data: any[];
  loading: boolean;
  error: any;
  empty: boolean;
}

// Simple fetch hook without SWR
export function useGetCashFlows(params?: CashFlowParams) {
  const [state, setState] = useState<CashFlowState>({
    data: [],
    loading: false,
    error: null,
    empty: false,
  });

  // Build URL with params
  const buildUrl = useCallback((filters?: CashFlowParams) => {
    if (!filters) return endpoints.cashflow.list;

    const searchParams = new URLSearchParams();

    if (filters.startDate) {
      searchParams.append('dateFrom', format(filters.startDate, 'yyyy-MM-dd'));
    }

    if (filters.endDate) {
      searchParams.append('dateTo', format(filters.endDate, 'yyyy-MM-dd'));
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'startDate' && key !== 'endDate' && value != null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return `${endpoints.cashflow.list}${queryString ? `?${queryString}` : ''}`;
  }, []);

  // Fetch function
  const fetchData = useCallback(async (filters?: CashFlowParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const url = buildUrl(filters);
      const response = await fetcher(url);

      setState({
        data: response?.data || [],
        loading: false,
        error: null,
        empty: !response?.data?.length,
      });

      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error,
      }));
      throw error;
    }
  }, [buildUrl]);

  // Auto-fetch when params change
  useEffect(() => {
    fetchData(params);
  }, [params, fetchData]);

  // Manual refetch functions
  const refetch = useCallback(() => fetchData(params), [params, fetchData]);

  const refetchWithParams = useCallback((newParams: CashFlowParams) => fetchData(newParams), [fetchData]);

  return {
    cashflow: state.data,
    cashflowLoading: state.loading,
    cashflowError: state.error,
    cashflowEmpty: state.empty,
    cashflowValidating: false, // Not needed without SWR
    refetch,
    refetchWithParams,
  };
}

export function useGetCloseCashFlows(params?: CashFlowParams) {
  const [state, setState] = useState<CashFlowState>({
    data: [],
    loading: false,
    error: null,
    empty: false,
  });

  // Build URL with params
  const buildUrl = useCallback((filters?: CashFlowParams) => {
    if (!filters) return endpoints.cashflow.closeCashFlows;

    const searchParams = new URLSearchParams();

    if (filters.startDate) {
      searchParams.append('dateFrom', format(filters.startDate, 'yyyy-MM-dd'));
    }

    if (filters.endDate) {
      searchParams.append('dateTo', format(filters.endDate, 'yyyy-MM-dd'));
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'startDate' && key !== 'endDate' && value != null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return `${endpoints.cashflow.list}${queryString ? `?${queryString}` : ''}`;
  }, []);

  // Fetch function
  const fetchData = useCallback(async (filters?: CashFlowParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const url = buildUrl(filters);
      const response = await fetcher(url);

      console.log('useGetCloseCashFlows response', response);

      setState({
        data: response || [],
        loading: false,
        error: null,
        empty: !response?.length,
      });

      return response;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error,
      }));
      throw error;
    }
  }, [buildUrl]);

  // Auto-fetch when params change
  useEffect(() => {
    fetchData(params);
  }, [params, fetchData]);

  // Manual refetch functions
  const refetch = useCallback(() => fetchData(params), [params, fetchData]);

  const refetchWithParams = useCallback((newParams: CashFlowParams) => fetchData(newParams), [fetchData]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    empty: state.empty,
    validating: false, // Not needed without SWR
    refetch,
    refetchWithParams,
  };
}


// Simple totals hook
export function useGetCashFlowTotals(params?: DateFilters) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const fetchTotals = useCallback(async (filters?: DateFilters) => {
    if (!filters?.startDate || !filters?.endDate) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const searchParams = new URLSearchParams();
      searchParams.append('dateFrom', format(filters.startDate, 'yyyy-MM-dd'));
      searchParams.append('dateTo', format(filters.endDate, 'yyyy-MM-dd'));

      const url = `${endpoints.cashflow.totals}?${searchParams.toString()}`;
      const response = await fetcher(url);

      setState({
        data: response,
        loading: false,
        error: null,
      });

      // eslint-disable-next-line consistent-return
      return response;
    } catch (error) {
      setState((prev: any) => ({
        ...prev,
        loading: false,
        error,
      }));
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchTotals(params);
  }, [params, fetchTotals]);

  const refetchTotals = useCallback(() => fetchTotals(params), [params, fetchTotals]);
  const refetchWithParams = useCallback((newParams: CashFlowParams) => fetchTotals(newParams), [fetchTotals]);


  return {
    totalsData: state.data,
    totalsLoading: state.loading,
    totalsError: state.error,
    totalsValidating: false,
    refetchTotals,
    refetchWithParams
  };
}

// ----------------------------------------------------------------------

export function useGetCashFlow(id?: number | string) {
  const url = id ? `${endpoints.cashflow.getOne}/${id}` : null;

  const { data, isLoading, error, isValidating } = useSWR<GetOneCashFlowData>(
    url,
    url ? fetcher : null,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      cashflow: data || {},
      cashflowLoading: isLoading,
      cashflowError: error,
      cashflowValidating: isValidating,
      cashflowEmpty: !isLoading && !isValidating && !data,
      refresh: () => url && mutate(url)
    }),
    [data, error, isLoading, isValidating, url]
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
  return axios.patch(`${url}/${id}`, {...payload, updatedby, payments: payload.payments.map((payment: any) => ({...payment, id: payment.id > 0 ? payment.id : undefined}))});
}

export async function deleteAlly(id: number) {
  const url = `${endpoints.ally.delete}/${id}`;
  return axios.delete(url);
}

type CreatePersonResponse = {
  data: {
    id: number;
    name: string;
    source: string;
  }
}

export async function createExternalPerson(payload: ExternalPersonSchemaType): Promise<AxiosResponse<CreatePersonResponse>> {
  const url = endpoints.cashflow.createPerson;
  return axios.post(url, payload);
}

export async function createExternalProperty(payload: ExternalPropertySchemaType): Promise<AxiosResponse<CreatePersonResponse>> {
  const url = endpoints.cashflow.createProperty;
  return axios.post(url, payload);
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

