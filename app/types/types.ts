export interface Warehouse {
    id: number;
    name: string;
    address: any;
    createdAt: string;
    updatedAt: string;
}

export interface ProductsInShipmentOrdersEntity {
    products: Product;
    shipmentOrder: number;
    units: number;
    isInTransportationBox: boolean;
    transportationBox?: Product;
    product: number | null;
}
export interface Product {
    id: number;
    name: string;
    ean: string;
    isTransportationBox: boolean;
    createdAt: string;
    updatedAt: string;
}

export type AuxParameters = {
    isBox: boolean | null | undefined;
    showItems: boolean;
    handleClick: any;
    item: ProductsInShipmentOrdersEntity;
};