export interface Warehouse {
  id: number;
  name: string;
  address: any;
  synchronizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentOrder {
  id: number;
  originId: number;
  destinationId: number;
  statusId: number;
  createdAt: string;
  updatedAt: string;
  synchronizationId: string;
  fulfilledById?: number;
  productsInShipmentOrders: ProductsInShipmentOrder[];
  productsInBoxes: ProductsInShipmentOrder[];
}

export interface ProductsInShipmentOrder {
  id: number
  productId: number
  shipmentOrderId: number
  units: number
  isInTransportationBox: boolean
  transportationBoxId?: number
  product: Product
  transportationBox?: TransportationBox
}

export interface TransportationBox {
  id: number
  name: string
  ean: string
  isTransportationBox: boolean
  createdAt: string
  updatedAt: string
}


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
  id: number;
  name: string;
  synchronizationId: string;
  createdAt: string;
  updatedAt: string;
};

export enum OrderStatusEnum {
  Pending = 1,
  Fulfilled = 2,
  Canceled = 3,
}