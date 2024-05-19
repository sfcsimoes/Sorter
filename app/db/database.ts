import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, deleteDatabaseAsync } from "expo-sqlite";
import * as schema from "@/db/schema";
import { ConsoleLogWriter, eq, isNull, asc, desc } from "drizzle-orm";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations.js";
import { OrderStatus, Product, ShipmentOrder, SyncOrders, User, Warehouse } from "@/types/types";
import uuid from 'react-native-uuid';
import { useServerConnectionStore } from "@/Stores/serverConnectionStore";
import { useInterfaceStore } from "@/Stores/interfaceStore";
const connectionStore = useServerConnectionStore.getState();
const interfaceStore = useInterfaceStore.getState();

export class DatabaseHelper {
    public db: any;
    public expo: any;
    constructor() {
        this.expo = openDatabaseSync("db.db");
        this.db = drizzle(this.expo, { schema });
    }

    async useFetch(url: any, method: any, body: any, maxTime: number = 15) {
        let data;
        let wasSuccessful = true;
        const controller = new AbortController();

        const requestOptions: RequestInit = {
            method: method,
            signal: controller.signal
        };

        if (method != 'GET') {
            requestOptions.body = JSON.stringify(body);
        }

        try {
            setTimeout(() => controller.abort(), 1000 * maxTime);
            const response = await fetch(process.env.EXPO_PUBLIC_API_URL + url, requestOptions);

            data = JSON.parse(await response.text());
            if (response.status != 200) {
                throw ''
            }
            if (!connectionStore.hasConnection) {
                connectionStore.setConnection(true);
            }
        } catch (e) {
            connectionStore.setConnection(false)
            wasSuccessful = false;
        }
        return { data, wasSuccessful };
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

    async getShipmentOrderById(id: number) {
        return await this.db.query.shipmentOrders.findFirst({
            where: eq(schema.shipmentOrders.id, id),
            with: {
                fulfilledBy: true
            },
            orderBy: [desc(schema.shipmentOrders.id)],
        });
    }

    async getShipmentOrdersByOrigin(id: number) {
        return await this.db.query.shipmentOrders.findMany({
            where: eq(schema.shipmentOrders.originId, id),
            orderBy: [desc(schema.shipmentOrders.id)],
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

    async getOrderStatus() {
        try {
            return await this.db.query.orderStatus.findMany();
        } catch (e) {
            console.log(e)
        }
        return [];
    }

    async getSyncOrders() {
        try {
            return await this.db.query.syncOrders.findMany(
                {
                    where: isNull(schema.syncOrders.synced)
                }
            );
        } catch (e) {
            console.log(e)
        }
        return [];
    }

    async syncUsers() {
        const result = await this.useFetch("/api/users", "GET", "");

        if (result.wasSuccessful) {
            result.data.forEach(async (user: User) => {
                const userLocal = await this.db.query.users.findFirst({
                    where: eq(schema.users.id, user.id)
                });
                if (!userLocal) {
                    await this.db.insert(schema.users).values(user);
                }
            });
        }
    }

    async syncWarehouses() {
        const result = await this.useFetch("/api/warehouses", "GET", "");

        if (result.wasSuccessful) {
            result.data.forEach(async (warehouse: Warehouse) => {
                const warehouseLocal = await this.db.query.warehouses.findFirst({
                    where: eq(schema.warehouses.id, warehouse.id)
                });
                if (!warehouseLocal) {
                    await this.db.insert(schema.warehouses).values(warehouse);
                }
            });
        }
    }

    async syncShipmentOrders(id: number) {
        const result = await this.useFetch("/api/orders?id=" + id, "GET", "", 10);
        if (result.wasSuccessful) {
            result.data.forEach(async (shipmentOrder: ShipmentOrder) => {
                let shipmentOrderLocal = await this.db.query.shipmentOrders.findFirst({
                    where: eq(schema.shipmentOrders.id, shipmentOrder.id)
                });
                if (!shipmentOrderLocal) {
                    await this.db.insert(schema.shipmentOrders).values(shipmentOrder);

                    shipmentOrder.productsInShipmentOrders.forEach(async (product) => {
                        await this.db.insert(schema.productsInShipmentOrders).values(product);
                    });
                } else {
                    if (shipmentOrderLocal.synchronizationId != shipmentOrder.synchronizationId
                        && new Date(shipmentOrder.updatedAt) > new Date(shipmentOrderLocal.updatedAt)
                    ) {
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
    }

    async syncProducts() {
        const result = await this.useFetch("/api/products", "GET", "");
        if (result.wasSuccessful) {
            result.data.forEach(async (product: Product) => {
                const find = await this.db.query.products.findFirst({
                    where: eq(schema.products.id, product.id)
                });
                if (!find) {
                    await this.db.insert(schema.products).values(product);
                }
            });
        }
    }

    async syncOrderStatus() {
        const result = await this.useFetch("/api/orderStatus", "GET", "");
        if (result.wasSuccessful) {
            result.data.forEach(async (orderStatus: OrderStatus) => {
                const find = await this.db.query.orderStatus.findFirst({
                    where: eq(schema.orderStatus.id, orderStatus.id)
                });
                if (!find) {
                    await this.db.insert(schema.orderStatus).values(orderStatus);
                }
            });
        }
    }

    async sendShipmentOrders() {
        let updated = 0;
        let syncOrders: SyncOrders[] = await this.db.query.syncOrders.findMany(
            {
                where: isNull(schema.syncOrders.synced)
            }
        );
        syncOrders.forEach(async (element) => {
            let shipmentOrder = await this.db.query.shipmentOrders.findFirst({
                where: eq(schema.shipmentOrders.id, element.shipmentOrderId),
                with: {
                    productsInShipmentOrders: true
                },
            });
            try {
                let request = await fetch(
                    process.env.EXPO_PUBLIC_API_URL + "/api/order",
                    {
                        method: "PUT",
                        body: JSON.stringify(shipmentOrder),
                    }
                );
                if (request.status == 200) {
                    updated = updated + 1;
                    await this.db.update(schema.syncOrders)
                        .set({ synced: new Date().toISOString() })
                        .where(eq(schema.syncOrders.id, element.id))
                } else {
                    throw "Erro";
                }
            } catch (e) {
                console.log(e);
            }
        });
        if (updated > 0) {
            console.log('Inside')
            interfaceStore.setRefresh(true);
        } else {
            interfaceStore.setRefresh(false);
        }
    }

    async updateLocalShipmentOrders(shipmentOrder: ShipmentOrder) {
        await this.db.transaction(async (tx: any) => {
            try {
                var shipmentOrderId = await tx.update(schema.shipmentOrders)
                    .set({
                        statusId: shipmentOrder.statusId,
                        updatedAt: new Date().toISOString(),
                        synchronizationId: uuid.v4().toString(),
                        fulfilledById: shipmentOrder.fulfilledById
                    })
                    .where(eq(schema.shipmentOrders.id, shipmentOrder.id))

                shipmentOrder.productsInShipmentOrders.forEach(async (product) => {
                    await tx.update(schema.productsInShipmentOrders)
                        .set({
                            isInTransportationBox: product.isInTransportationBox,
                            transportationBoxId: product.transportationBoxId,
                        })
                        .where(eq(schema.productsInShipmentOrders.id, product.id))
                });
                await tx.insert(schema.syncOrders).values({ shipmentOrderId: shipmentOrder.id });

            } catch (error) {
                await tx.rollback();
            }
        });
    }

}
