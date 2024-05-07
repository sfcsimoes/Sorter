export type Warehouse = {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  originId: string;
  destinationId: string;
  statusId: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Product = {
  id: string;
  name: string;
  ean: string;
  isTransportationBox: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus = {
  id: string;
  name: string;
  synchronizationId: string;
  createdAt: string;
  updatedAt: string;
};