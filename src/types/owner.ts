import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type IOwnerTableFilters = {
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

export type IOwnerItem = {
  id?: number;
  status: string;
  name: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  birthdate?: string;
  isInvestor: boolean;
};
