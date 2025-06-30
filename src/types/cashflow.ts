import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type ICashFlowTableFilters = {
  name: string;
  status: string;
};

export type IOrderHistory = {
  orderTime: IDateValue;
  paymentTime: IDateValue;
  deliveryTime: IDateValue;
  completionTime: IDateValue;
  timeline: { title: string; time: IDateValue }[];
};

export type IOrderShippingAddress = {
  fullAddress: string;
  phoneNumber: string;
};

export type ICashFlowPaymentCurrency = {
  id: number;
  name: string;
  code: string;
}

export type ICashFlowWayToPay = {
  id: number;
  name: string;
}

export type ICashFlowPaymentEntity = {
  id: number;
  name: string;
};

export type ICashFlowPaymentTransactionType = {
  id: number;
  name: string;
};

export type ICashFlowPayment = {
  id: number;
  cashflow: number;
  canon: number;
  contract: boolean;
  guarantee: boolean;
  serviceType?: string;
  reason?: string;
  service?: string;
  taxPayer?: string;
  amount: number;
  currency: number;
  wayToPay: number;
  transactionType: number;
  totalDue: number;
  incomeByThird: number;
  entity: number;
  pendingToCollect: number;
  observation?: string;
  "currencyData": ICashFlowPaymentCurrency,
  "entityData": ICashFlowPaymentEntity,
  "wayToPayData": ICashFlowWayToPay,
  "transactionTypeData": ICashFlowPaymentTransactionType
};

export type IPersonCashFlow = {
  id: number;
  name: string;
  source: string;
};

export type ITransactionType = {
  id: number;
  name: string;
  description?: string;
};

export type IWayToPay = {
  id: number;
  name: string;
};

export type IEntity = {
  id: number;
  name: string;
};

export type ICurrency = {
  id: number;
  name: string;
  code: string,
  symbol: string;
};

export type IPropertyCashFlow = {
  id: number;
  name: string;
  location: string
};

export type ICashFlowTotalAmount = {
  currency: number;
  currency_code: string;
  total_income: number;
  total_outcome: number;
  total_pending_to_collect: number;
  total_due: number;
};

export type ICashFlowPropertyData = {
  id: string;
  name: string;
  location: string;
};


export type ICashFlowClientData = {
  id: string;
  name: string;
};

export type ICashFlowPersonData = {
  id: string;
  name: string;
  source: string;
};

export type ICloseCashFlowItem = {
  id: number;
  createdAt: IDateValue;
  updatedAt: IDateValue;
  date: IDateValue;
  data: any
}

export type ISimpleCashFlowPaymentData = {
  id: number;
  cashflow: number;
  canon: boolean;
  contract: boolean;
  guarantee: boolean;
  serviceType: string;
  reason: string;
  service: string;
  taxPayer: string;
  amount: number;
  currency: number;
  wayToPay: number;
  transactionType: number;
  totalDue: number;
  incomeByThird: number;
  entity: number;
  pendingToCollect: number;
  observation?: string;
}

export type ISimpleCashFlowData = {
  id: number;
  user: number;
  owner: number;
  location: string;
  type: string;
  person: number;
  client: number;
  property: number;
  month: string;
  attachments: string[];
  totalQuantity: number;
  createdAt: IDateValue;
  updatedAt: IDateValue;
  createdBy: {
    id: number;
    name: string;
    email: string;
    username: string
  };
  updatedby?: {
    id: number;
    name: string;
    email: string;
    username: string
  };
  date: IDateValue;
  isTemporalTransaction: boolean;
  temporalTransactionId?: number;
}

export type ICashFlowItem = {
  id: number;
  client?: number;
  user: number;
  owner?: number;
  location?: string;
  person?: number;
  month: string;
  totalQuantity: number;
  createdAt: IDateValue;
  updatedAt: IDateValue;
  createdBy: {
    id: number;
    name: string;
    email: string;
    username: string
  };
  updatedby?: {
    id: number;
    name: string;
    email: string;
    username: string
  };
  date: IDateValue;
  isTemporalTransaction: boolean;
  temporalTransactionId?: number;
  payments: ICashFlowPayment[];
  attachments: string[];
  property?: number;
  type: string;
  total_amount: ICashFlowTotalAmount[];
  propertydata?: ICashFlowPropertyData;
  clientdata?: ICashFlowClientData;
  persondata?: ICashFlowPersonData;
};
