// ----------------------------------------------------------------------

export type IServiceItem = {
  id?: number;
  title: string;
};


export type ISubServiceItem = {
  id?: number;
  serviceId: number;
  service: string;
};
