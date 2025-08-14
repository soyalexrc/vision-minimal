import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type IClientDataFilters = {
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

export type IClientItem = {
  id?: number;
  status: string;
  serviceName: string;
  propertytype: string;
  typeOfPerson: string;
  occupation: string;
  headquarters: string;
  personEntry: string;
  location: string;
  allowpets: string;
  createdby?: {
    name: string;
    email: string;
    username: string;
    id: number;
  },
  assignedto?: {
    name: string;
    email: string;
    username: string;
    id: number;
  },
  allowyounger: string;
  propertyOfInterest?: string;
  budgetfrom: number;
  budgetto: number;
  amountOfPets: number;
  essentialFeatures: string[];
  zonesOfInterest: string[];
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
