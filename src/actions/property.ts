import type { SWRConfiguration } from 'swr';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

import { UploadService } from '../utils/files/upload';

import type { PropertyFormSchemaType } from '../sections/property/form/create-update-property-form';
import type {
  UtilityFormField,
  AdjacencyFormField,
  AttributeFormField,
  EquipmentFormField, IPropertyItemPreview, IPropertyCategoryItem, DistributionFormField, IPropertyItemCreateUpdate,
} from '../types/property';

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

type IPropertyCategoryItemData = {
  data: IPropertyCategoryItem[];
  total: number;
}

type PropertyData = {
  data: IPropertyItemCreateUpdate;
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

  const { data, isLoading, error, isValidating } = useSWR<IPropertyCategoryItemData>(url, fetcher, swrOptions);

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

export function useGetProperty(id: string) {
  const url = endpoints.property.edit + '/' + id;

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

export async function createUpdateProperty(payload: PropertyFormSchemaType, type: 'create' | 'update', id?: string | number) {
  const imagesUploaded = payload.images.filter((image: any) => typeof image === 'string' && image.startsWith('http'));
  const imagesToUpload = payload.images.filter((image: any) => typeof image === 'object' && image instanceof File);

  if (imagesToUpload.length > 0) {
    const newImagesUploaded  = await UploadService.uploadMultiple(imagesToUpload);
    payload.images = [...imagesUploaded, ...newImagesUploaded.urls];
    console.log('newImagesUploaded', newImagesUploaded);
  }

  const documentsUploaded = payload.documents.filter((doc: any) => typeof doc === 'string' && doc.startsWith('http'));
  const documentsToUpload = payload.documents.filter((doc: any) => typeof doc === 'object' && doc instanceof File);


  if (documentsToUpload.length > 0) {
    const newDocumentsUploaded =  await UploadService.uploadMultiple(documentsToUpload);
    payload.documents = [...documentsUploaded, ...newDocumentsUploaded.urls];

    console.log('newDocumentsUploaded', newDocumentsUploaded);
  }

  payload.adjacencies = payload.adjacencies.filter((item: AdjacencyFormField) => item?.value === 'true');
  payload.attributes = payload.attributes.filter((item: AttributeFormField) => item?.value === 'true');
  payload.equipments = payload.equipments.filter((item: EquipmentFormField) => item?.value === 'true');
  payload.utilities = payload.utilities.filter((item: UtilityFormField) => item?.value === 'true');
  payload.distributions  = payload.distributions.filter((item: DistributionFormField) => item?.value === 'true');

  const url = `${endpoints.property.create}`;

  if (type === 'update' && id) {
    return axios.patch(`${url}/${id}`, payload);
  } else {
    return axios.post(url, payload);
  }
}

export async function deleteManyProperties(ids: string[]) {
  const url = `${endpoints.property.delete}/remove-many`;
  return axios.post(url, { ids });
}

export async function deleteProperty(id: string) {
  const url = `${endpoints.property.delete}/${id}`;
  return axios.delete(url);
}

export async function updatePropertyStatus(id: string, status: string) {
  const url = `${endpoints.property.editStatus}/${id}`;
  return axios.patch(url, { status });
}

export async function updatePropertyFeatured(id: string, isFeatured: boolean) {
  const url = `${endpoints.property.editFeatured}/${id}`;
  return axios.patch(url, { isFeatured });
}

export async function restoreProperty(id: string) {
  const url = `${endpoints.property.restore}`;
  return axios.post(url, { id });
}
