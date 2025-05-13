import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type IExternalAdviserFilters = {
  name: string;
  status: string;
};

export type IProductTableFilters = {
  stock: string[];
  publish: string[];
};

export type IProductReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  helpful: number;
  avatarUrl: string;
  postedAt: IDateValue;
  isPurchased: boolean;
  attachments?: string[];
};

export type IExternalAdviserItem = {
  id?: number;
  status: string;
  name: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  realStateCompanyName: string;
};
