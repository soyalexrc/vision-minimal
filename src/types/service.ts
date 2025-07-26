// ----------------------------------------------------------------------

export type IServiceItem = {
  id?: number;
  title: string;
  enabled: boolean;
  commissionPercentage: number;
  order: number;
};


export type ISubServiceItem = {
  id?: number;
  serviceId: number;
  service: string;
};
