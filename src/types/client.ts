import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type IProductFilters = {
  rating: string;
  gender: string[];
  category: string;
  colors: string[];
  priceRange: number[];
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

export type IClientItem = {
  id?: number;
  status: string;
  serviceName: string;
  propertytype: string;
  typeOfPerson: string;
  allowpets: string;
  allowyounger: string;
  propertyOfInterest?: string;
  budgetfrom: number;
  budgetto: number;
  amountOfPets: number;
  amountOfYounger: number;
  contactFrom: string;
  specificRequirement?: string;
  requestracking?: string;
  isinwaitinglist: boolean;
  isPotentialInvestor: boolean;
  adviserName?: string;
  name: string;
  lastname: string;
  email: string;
  phone: string;
};
