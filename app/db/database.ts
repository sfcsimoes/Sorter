import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, deleteDatabaseAsync } from "expo-sqlite/next";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations.js";
import { View, Text } from "react-native";
import * as SQLite from 'expo-sqlite/next';

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

    async getWarehouses() {
        return await this.db.query.warehouses.findMany();
    }

    async getWarehouse(id: number) {
        return await this.db.query.warehouses.findFirst({
            where: eq(schema.warehouses.id, id)
        });
    }

    async syncWarehouses() {
        var response = await fetch(process.env.EXPO_PUBLIC_API_URL + "/warehouses");
        let result = JSON.parse(await response.text());

        result.forEach(async (warehouse: schema.Warehouse) => {
            const i = await this.db.query.warehouses.findFirst({
                where: eq(schema.warehouses.id, warehouse.id)
            });
            if (!i) {
                var x = {
                    name: warehouse.name,
                    address: warehouse.address,
                };
                await this.db.insert(schema.warehouses).values(x);
            }
        });
    }

    async getShipmentOrders(id: number) {
        return await this.db.query.shipmentOrders.findMany({
            where: eq(schema.shipmentOrders.originId, id)
        });
    }

    async syncShipmentOrders(id: number) {
        var response = await fetch(process.env.EXPO_PUBLIC_API_URL + "/shipmentOrders/" + id);
        let result = JSON.parse(await response.text());


        result.forEach(async (shipmentOrder: schema.ShipmentOrder) => {
            const i = await this.db.query.shipmentOrders.findFirst({
                where: eq(schema.shipmentOrders.id, shipmentOrder.id)
            });

            if (!i) {
                var x = {
                    originId: shipmentOrder.originId,
                    destinationId: shipmentOrder.destinationId,
                    status: shipmentOrder.status
                };
                await this.db.insert(schema.shipmentOrders).values(x);
            }
        });
    }


}
