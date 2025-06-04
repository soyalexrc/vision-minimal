import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type IPropertyDataFilters = {
  name: string;
  status: string;
  propertyType: string[];
  operationType: string[];
  isFeatured?: boolean;
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
  codeId: number;
  slug: string;
  realStateAdviser: string;
  publicationTitle: string;
  coverUrl: string;
  images: string[];
  propertyType: string;
  operationType: string;
  realstateadvisername: string;
  price: number;
  createdAt: IDateValue;
  updatedAt: IDateValue;
  isActive: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  userId: string;
};

export type IPropertyCategoryItem = {
  id?: number;
  title: string;
  description: string;
  titlePlural: string;
  isFeatured: boolean;
  image?: string;
};

export type IPropertyItemDetail = {
  id: string;
  images: string[];
  slug: string;
  userId: string;
  codeId: number;
  realStateAdviser: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  publicationTitle: string;
  code: string;
  propertyType: string;
  footageBuilding: string;
  footageGround: string;
  description: string;
  price: string;
  state: string;
  avenue: string;
  city: string;
  country: string;
  howToGet: string;
  municipality: string;
  referencePoint: string;
  urbanization: string;
  street: string;
  isClosedStreet: string;
  negotiationInformation: {
    id: string;
    propertyId: string;
    price: string;
    minimumNegotiation: string;
    client: string;
    reasonToSellOrRent: string;
    partOfPayment: string;
    mouthToMouth: boolean;
    realStateGroups: boolean;
    realStateWebPages: boolean;
    socialMedia: boolean;
    publicationOnBuilding: boolean;
    operationType: string;
    propertyExclusivity: string;
    ownerPaysCommission: string;
    rentCommission: string;
    sellCommission: string;
    ally: string;
    externalAdviser: string;
    realStateAdviser: string;
    additionalPrice: string;
    realstateadvisername: string;
    externaladvisername: string;
    allyname: string;
  };
  attributes: {
    attributeId: number;
    value: string;
    valueType: string;
    createdAt: string;
    attribute: {
      id: number;
      label: string;
      placeholder: string | null;
      options: string | null;
      formType: string;
    };
  }[];
  equipments: {
    equipmentId: number;
    brand?: string;
    additionalInformation?: string;
    createdAt: string;
    equipment: {
      id: number;
      title: string;
      description?: string;
    };
  }[];
  distributions: {
    distributionId: number;
    additionalInformation?: string;
    createdAt: string;
    distribution: {
      id: number;
      title: string;
      description?: string;
    };
  }[];
  utilities: {
    utilityId: number;
    createdAt: string;
    additionalInformation?: string;
    utility: {
      id: number;
      title: string;
      description?: string;
    };
  }[];
  adjacencies: {
    adjacencyId: number;
    createdAt: string;
    adjacency: {
      id: number;
      title: string;
      description?: string;
    };
  }[];
};

export type IPropertyItemCreateUpdate = {
  id?: string;
  userId: string;
  images?: string[];
  distributions?: any[];
  adjacencies?: any[];
  attributes?: any[];
  equipments?: any[];
  utilities?: any[];
  furnishedAreas?: any;
  status: string;
  updatedby?: any;
  changes?: any;
  createdby?: any;

  generalInformation: {
    id?: string;
    code?: string;
    publicationTitle: string;
    footageGround: string;
    footageBuilding: string;
    description: string;
    propertyType: string;
    zoning?: string;
    propertyCondition?: string;
    antiquity?: string;
    amountOfFloors?: string;
    typeOfWork?: string;
    propertiesPerFloor?: string;
    handoverKeys: boolean;
    termsAndConditionsAccepted: boolean;
    isFurnished: boolean;
    isOccupiedByPeople: boolean;
  };

  locationInformation: {
    id?: string;
    location?: string;
    nomenclature?: string;
    tower?: string;
    amountOfFloors?: string;
    isClosedStreet?: string;
    country: string;
    state: string;
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
    propertyDoc: boolean;
    CIorRIF: boolean;
    ownerCIorRIF: boolean;
    spouseCIorRIF: boolean;
    isCatastralRecordSameOwner: boolean;
    condominiumSolvency: boolean;
    mainProperty: boolean;
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
    price: string;
    minimumNegotiation?: string;
    client?: string;
    reasonToSellOrRent?: string;
    realstateadvisername?: string;
    externaladvisername?: string;
    partOfPayment?: string;
    operationType: string;
    ally?: string;
    allyname?: string;
    propertyExclusivity: string;
    realStateAdviser?: string;
    additional_price?: string;
    externalAdviser?: string;
    sellCommission?: string;
    rentCommission?: string;
    ownerPaysCommission?: string;
    mouthToMouth: boolean;
    realStateGroups: boolean;
    realStateWebPages: boolean;
    socialMedia: boolean;
    publicationOnBuilding: boolean;
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
