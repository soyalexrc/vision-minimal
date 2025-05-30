import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type IPropertyDataFilters = {
  name: string;
  status: string;
  propertyType: string[];
  operationType: string[];
};

export interface Attribute {
  id: number;
  label: string;
  placeholder?: string;
  options?: string; // JSON string for select/radio options
  formType: 'text' | 'number' | 'check' | 'select' | 'radio' | 'textarea';
}

export interface AttributeFormField {
  attributeId: number;
  value: string;
  valueType: 'string' | 'number' | 'boolean';
  // Include attribute details for rendering
  attribute: Attribute;
}

export interface Distribution {
  id: number;
  title: string;
  description?: string;
}

export interface DistributionFormField {
  distributionId: number;
  distribution: Distribution;
  additionalInformation?: string;
  value: string; // Add this line
}

export interface Equipment {
  id: number;
  title: string;
  description?: string;
}

export interface EquipmentFormField {
  equipmentId: number;
  equipment: Equipment;
  additionalInformation?: string;
  brand?: string;
  value: string; // Add this line
}

export interface Utility {
  id: number;
  title: string;
  description?: string;
}

export interface UtilityFormField {
  utilityId: number;
  utility: Utility;
  additionalInformation?: string;
  value: string; // Add this line
}

export interface Adjacency {
  id: number;
  title: string;
  description?: string;
}

export interface AdjacencyFormField {
  adjacencyId: number;
  adjacency: Adjacency;
  additionalInformation?: string;
  value: string; // Add this line
}

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

export type IPropertyItemCreateUpdate = {
  id?: string;
  userId?: string;
  images?: string[];
  distributions?: any;
  attributes?: any;
  equipments?: any;
  utilities?: any;
  furnishedAreas?: any;
  status: string;
  updatedby?: any;
  changes?: any;
  createdby?: any;

  generalInformation: {
    id?: string;
    code?: string;
    publicationTitle?: string;
    footageGround?: string;
    footageBuilding?: string;
    description?: string;
    propertyType?: string;
    zoning?: string;
    propertyCondition?: string;
    antiquity?: string;
    amountOfFloors?: string;
    typeOfWork?: string;
    propertiesPerFloor?: string;
    handoverKeys?: boolean;
    termsAndConditionsAccepted?: boolean;
    isFurnished?: boolean;
    isOccupiedByPeople?: boolean;
  };

  locationInformation: {
    id?: string;
    location?: string;
    nomenclature?: string;
    tower?: string;
    amountOfFloors?: string;
    isClosedStreet?: string;
    country?: string;
    state?: string;
    municipality?: string;
    urbanization?: string;
    avenue?: string;
    city?: string;
    street?: string;
    buildingShoppingCenter?: string;
    buildingNumber?: string;
    floor?: string;
    referencePoint?: string;
    howToGet?: string;
    trunkNumber?: string;
    trunkLevel?: string;
    parkingNumber?: string;
    parkingLevel?: string;
  };

  documentsInformation: {
    id?: string;
    propertyDoc?: boolean;
    CIorRIF?: boolean;
    ownerCIorRIF?: boolean;
    spouseCIorRIF?: boolean;
    isCatastralRecordSameOwner?: boolean;
    condominiumSolvency?: boolean;
    mainProperty?: boolean;
    mortgageRelease?: string;
    condominiumSolvencyDetails?: string;
    power?: string;
    successionDeclaration?: string;
    courtRulings?: string;
    catastralRecordYear?: string;
    attorneyEmail?: string;
    attorneyPhone?: string;
    attorneyFirstName?: string;
    attorneyLastName?: string;
    realStateTax?: string;
    owner?: string;
  };

  negotiationInformation: {
    id?: string;
    price?: string;
    minimumNegotiation?: string;
    client?: string;
    reasonToSellOrRent?: string;
    realstateadvisername?: string;
    externaladvisername?: string;
    partOfPayment?: string;
    operationType?: string;
    ally?: string;
    allyname?: string;
    propertyExclusivity?: string;
    realStateAdviser?: string;
    additional_price?: string;
    externalAdviser?: string;
    sellCommission?: string;
    rentCommission?: string;
    ownerPaysCommission?: string;
    mouthToMouth?: boolean;
    realStateGroups?: boolean;
    realStateWebPages?: boolean;
    socialMedia?: boolean;
    publicationOnBuilding?: boolean;
  };
};

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
