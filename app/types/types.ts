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
    productsInShipmentOrders: ProductsInShipmentOrder[];
    productsInBoxes: ProductsInShipmentOrder[];
}

export interface ProductsInShipmentOrder {
    id: number
    productId: number
    shipmentOrderId: number
    units: number
    fulfilledBy: any
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
    isBox: boolean | null | undefined;
    showItems: boolean;
    handleClick: any;
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
