import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type IPropertyDataFilters = {
  name: string;
  status: string;
  propertyType: string[];
  operationType: string[];
};

export type IPropertyItemPreview = {
  id: string;
  status: string;
  publicationTitle: string;
  coverUrl: string;
  propertyType: string;
  operationType: string;
  adviserName: string;
  price: number;
  createdAt: IDateValue;
  updatedAt: IDateValue;
  isActive: boolean;
  isPublished: boolean;
}


export type IPropertyCategoryItem = {
  id?: number;
  title: string;
  description: string;
  titlePlural: string;
  isFeatured: boolean;
  image?: string;
}

export type IPropertyItem = {
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
