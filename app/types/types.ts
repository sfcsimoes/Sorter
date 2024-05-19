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
    fulfilledBy?: User;
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

export interface Product {
    id: number
    name: string
    ean: string
    isTransportationBox: boolean
    createdAt: string
    updatedAt: string
}
export interface TransportationBox {
    id: number
    name: string
    ean: string
    isTransportationBox: boolean
    createdAt: string
    updatedAt: string
}

export type AuxParameters = {
    transportationBoxId: number | undefined;
    isBox: boolean;
    item: ProductsInShipmentOrder | null;
};

export type ProductsInBoxes = {
    transportationBoxId: number | undefined
    products: ProductsInShipmentOrder[]
}

export interface OrderStatus {
    id: number
    name: string
    synchronizationId: string
    createdAt: string
    updatedAt: string
}

export interface SyncOrders {
    id: number
    shipmentOrderId: number
    synced: string
}

export type ShowBoxItem = {
    transportationBoxId: number | undefined
    show: boolean
}

export enum OrderStatusEnum {
    Pending = 1,
    Fulfilled = 2,
    Canceled = 3,
}

export type User = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
};
