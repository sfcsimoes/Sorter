import {  integer, text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

export const products = sqliteTable('products', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	name: text('name'),
	ean: text('ean'),
	isTransportationBox: integer('isTransportationBox', { mode: 'boolean' }),
	createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const productsRelations = relations(products, ({ many }) => ({
	productsInShipmentOrders: many(productsInShipmentOrders),
}));

export const warehouses = sqliteTable('warehouses', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	name: text('name'),
	adress: text('adress'),
	createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const warehousesRelations = relations(warehouses, ({ many }) => ({
	shipmentOrders: many(shipmentOrders),
}));

export const sorterEntryPoints = sqliteTable('sorterEntryPoints', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	name: text('name'),
	active: integer('active', { mode: 'boolean' }),
	createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const stores = sqliteTable('stores', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	name: text('name'),
	createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const storesRelations = relations(stores, ({ many }) => ({
	shipmentOrders: many(shipmentOrders),
}));

export const shipmentOrders = sqliteTable('shipmentOrders', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	warehouse: integer('warehouseId').references(() => warehouses.id),
	store: integer('storeId').references(() => stores.id),
	status: text('status', { enum: ['Concluida', 'Cancelada', 'Pendente'] }),
	createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const shipmentOrdersRelations = relations(shipmentOrders, ({ many }) => ({
	productsInShipmentOrders: many(productsInShipmentOrders),
}));

export const productsInShipmentOrders = sqliteTable('productsInShipmentOrders', {
	product: integer('productId').references(() => products.id),
	shipmentOrder: integer('shipmentOrderId').references(() => shipmentOrders.id),
	units: integer('units'),
	isInTransportationBox: integer('isInTransportationBox', { mode: 'boolean' }),
	transportationBox: integer('transportationBoxId').references(() => products.id),
}, (t) => ({
	pk: primaryKey({ columns: [t.product, t.shipmentOrder] })
}));

export const productsInShipmentOrdersRelations = relations(productsInShipmentOrders, ({ one }) => ({
	products: one(products, {
		fields: [productsInShipmentOrders.product],
		references: [products.id],
	}),
	shipmentOrders: one(shipmentOrders, {
		fields: [productsInShipmentOrders.shipmentOrder],
		references: [shipmentOrders.id],
	}),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;

export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse= typeof warehouses.$inferInsert;

export type ShipmentOrder = typeof shipmentOrders.$inferSelect;
export type NewShipmentOrder = typeof shipmentOrders.$inferInsert;

export type ProductsInShipmentOrders = typeof productsInShipmentOrders.$inferSelect;
export type NewProductsInShipmentOrders = typeof productsInShipmentOrders.$inferInsert;