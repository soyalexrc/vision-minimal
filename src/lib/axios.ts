import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/auth/me',
    signIn: '/auth/sign-in',
    signUp: '/api/auth/sign-up',
  },
  ally: {
    list: '/ally',
    create: '/ally',
    edit: '/ally',
    restore: '/ally/restore',
    details: '/ally/details',
    search: '/ally/search',
    delete: '/ally'
  },
  cashflow: {
    list: '/cashflow',
    create: '/cashflow',
    edit: '/cashflow',
    createPerson: '/cashflow/person',
    people: '/cashflow/person',
    properties: '/cashflow/property',
    transactionTypes: '/transaction-types',
    waysToPay: '/ways-to-pay',
    currencies: '/currencies',
    entities: '/entities',
  },
  subService: {
    list: '/service/subservice'
  },
  service: {
    list: '/service',
    create: '/service',
    edit: '/service',
    restore: '/service/restore',
    details: '/service/details',
    search: '/service/search',
    delete: '/service'
  },
  category: {
    list: '/category',
    create: '/category',
    edit: '/category',
    restore: '/category/restore',
    details: '/category/details',
    search: '/category/search',
    delete: '/category'
  },
  client: {
    list: '/client',
    create: '/client',
    edit: '/client',
    editStatus: '/client/status',
    delete: '/client',
    details: '/client/details',
    search: '/client/search',
    restore: '/client/restore',
  },
  property: {
    category: {
      list: '/category',
      create: '/category',
      edit: '/category',
      delete: '/category',
    },
    list: '/property',
    create: '/property',
    edit: '/property/edit',
    editStatus: '/property/status',
    editFeatured: '/property/featured',
    delete: '/property',
    detail: '/property/detail',
    search: '/property/search',
    restore: '/property/restore',
  },

  user: {
    list: '/user',
    details: '/user/details',
    search: '/user/search',
    create: '/user',
    edit: '/user',
  },
  owner: {
    list: '/owner',
    create: '/owner',
    edit: '/owner',
    restore: '/owner/restore',
    delete: '/owner',
    details: '/ally/details',
    search: '/ally/search',
  },
  externalAdviser: {
    list: '/external-adviser',
    details: '/external-adviser/details',
    create: '/external-adviser',
    edit: '/external-adviser',
    restore: '/external-adviser/restore',
    delete: '/external-adviser',
    search: '/external-adviser/search',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  config: {
    byId: '/config',
    // list: '/api/post/list',
    // details: '/api/post/details',
    // latest: '/api/post/latest',
    // search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
