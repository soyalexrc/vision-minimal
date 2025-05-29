import type { SWRConfiguration } from 'swr';
import type { IProductItem } from 'src/types/product';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

import type { IPropertyItem, IPropertyItemPreview, IPropertyCategoryItem } from '../types/property';
import type { PropertyFormSchemaType } from '../sections/property/form/create-update-property-form';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type PropertiesData = {
  data: IPropertyItemPreview[];
  total: number;
}

type IPropertyCategoryItem = {
  data: IPropertyCategoryItem[];
  total: number;
}

type PropertyData = {
  data: IPropertyItem;
}

export function useGetProperties() {
  const url = endpoints.property.list;

  const { data, isLoading, error, isValidating } = useSWR<PropertiesData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      properties: data?.data || [],
      propertiesLoading: isLoading,
      propertiesError: error,
      propertiesValidating: isValidating,
      propertiesEmpty: !isLoading && !isValidating && !data?.data?.length,
      count: data?.total || 0,
      refresh: () => mutate(url)
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------


export function useGetCategories() {
  const url = endpoints.property.category.list;

  const { data, isLoading, error, isValidating } = useSWR<IPropertyCategoryItem>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      categories: data?.data || [],
      categoriesLoading: isLoading,
      categoriesError: error,
      categoriesValidating: isValidating,
      categoriesEmpty: !isLoading && !isValidating && !data?.data?.length,
      count: data?.total || 0,
      refresh: () => mutate(url)
    }),
    [data?.data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetProperty(id: number | string) {
  const url = endpoints.client.edit + '/' + id;

  const { data, isLoading, error, isValidating } = useSWR<PropertyData>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      property: data?.data || {},
      propertyLoading: isLoading,
      propertyError: error,
      propertyValidating: isValidating,
      propertyEmpty: !isLoading && !isValidating && !data?.data,
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

export async function createProperty(payload: PropertyFormSchemaType) {
  const url = `${endpoints.client.create}`;
  return axios.post(url, payload);
}

export async function updateProperty(payload: PropertyFormSchemaType, id: number) {
  const url = `${endpoints.client.edit}/${id}`;
  return axios.patch(url, payload);
}

export async function deleteManyPropertys(ids: number[]) {
  const url = `${endpoints.client.delete}/remove-many`;
  return axios.post(url, { ids });
}

export async function deleteProperty(id: number) {
  const url = `${endpoints.client.delete}/${id}`;
  return axios.delete(url);
}

export async function restoreProperty(id: number) {
  const url = `${endpoints.client.restore}`;
  return axios.post(url, { id });
}
