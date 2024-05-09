import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, deleteDatabaseAsync } from "expo-sqlite";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations.js";
import { OrderStatus, Product, ProductsInShipmentOrder, ShipmentOrder, Warehouse } from "@/types/types";

export class DatabaseHelper {
    public db: any;
    public expo: any;
    constructor() {
        this.expo = openDatabaseSync("db.db");
        this.db = drizzle(this.expo, { schema });
    }

    async dropDatabase() {
        this.expo.closeAsync();
        deleteDatabaseAsync("db.db");
    }

    async Migration() {
        const expoDb = openDatabaseSync("db.db");
        const db = drizzle(expoDb);
        const { success, error } = useMigrations(db, migrations);
    }

    async getUser(id: number) {
        return await this.db.query.users.findFirst({
            where: eq(schema.users.id, id)
        });
    }

    async getWarehouses() {
        return await this.db.query.warehouses.findMany();
    }

    async getWarehouse(id: number) {
        return await this.db.query.warehouses.findFirst({
            where: eq(schema.warehouses.id, id)
        });
    }

    async syncWarehouses() {
        var response = await fetch(process.env.EXPO_PUBLIC_API_URL + "/api/warehouses");
        let result = JSON.parse(await response.text());

        result.forEach(async (warehouse: Warehouse) => {
            const i = await this.db.query.warehouses.findFirst({
                where: eq(schema.warehouses.id, warehouse.id)
            });
            if (!i) {
                try {
                    await this.db.insert(schema.warehouses).values(warehouse);
                } catch (e) {
                    console.log('Fail', e)
                }
            }
        });
    }

    async getShipmentOrder(id: number) {
        return await this.db.query.shipmentOrders.findFirst({
            where: eq(schema.shipmentOrders.id, id)
        });
    }

    async getShipmentOrders(id: number) {
        return await this.db.query.shipmentOrders.findMany({
            where: eq(schema.shipmentOrders.originId, id)
        });
    }

    async syncShipmentOrders(id: number) {
        var response = await fetch(process.env.EXPO_PUBLIC_API_URL + "/api/orders?id=" + id);
        let result = JSON.parse(await response.text());
        result.forEach(async (shipmentOrder: ShipmentOrder) => {
            let shipmentOrderLocal = await this.db.query.shipmentOrders.findFirst({
                where: eq(schema.shipmentOrders.id, shipmentOrder.id)
            });
            if (!shipmentOrderLocal) {
                await this.db.insert(schema.shipmentOrders).values(shipmentOrder);

                shipmentOrder.productsInShipmentOrders.forEach(async (product) => {
                    await this.db.insert(schema.productsInShipmentOrders).values(product);
                });
            } else {
                if (shipmentOrderLocal.synchronizationId != shipmentOrder.synchronizationId) {
                    await this.db.update(schema.shipmentOrders)
                        .set({
                            statusId: shipmentOrder.statusId,
                            updatedAt: shipmentOrder.updatedAt,
                            synchronizationId: shipmentOrder.synchronizationId
                        })
                        .where(eq(schema.shipmentOrders.id, shipmentOrderLocal.id))

                    shipmentOrder.productsInShipmentOrders.forEach(async (product) => {
                        // await this.db.insert(schema.productsInShipmentOrders).values(product);
                        await this.db.update(schema.productsInShipmentOrders)
                            .set({
                                isInTransportationBox: product.isInTransportationBox,
                                transportationBoxId: product.transportationBoxId,
                            })
                            .where(eq(schema.productsInShipmentOrders.id, product.id))
                    });
                }
            }
        });
    }

    async syncProducts() {
        var response = await fetch(process.env.EXPO_PUBLIC_API_URL + "/api/products");
        let result = JSON.parse(await response.text());

        result.forEach(async (product: Product) => {
            const find = await this.db.query.products.findFirst({
                where: eq(schema.products.id, product.id)
            });
            if (!find) {
                await this.db.insert(schema.products).values(product);
            }
        });
    }

    async getShipmentOrdersProducts(shipmentOrderId: number) {
        try {
            return await this.db.query.productsInShipmentOrders.findMany({
                where: eq(schema.productsInShipmentOrders.shipmentOrderId, shipmentOrderId),
                with: {
                    product: true,
                    transportationBox: true
                },
            });
        } catch (e) {
            console.log(e)
        }
        return [];
    }

    async syncOrderStatus() {
        var response = await fetch(process.env.EXPO_PUBLIC_API_URL + "/api/orderStatus");
        let result = JSON.parse(await response.text());

        result.forEach(async (orderStatus: OrderStatus) => {
            const find = await this.db.query.orderStatus.findFirst({
                where: eq(schema.orderStatus.id, orderStatus.id)
            });
            if (!find) {
                await this.db.insert(schema.orderStatus).values(orderStatus);
            }
        });
    }

    async getOrderStatus() {
        try {
            return await this.db.query.orderStatus.findMany();
        } catch (e) {
            console.log(e)
        }
        return [];
    }
}
