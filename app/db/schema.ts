import {  integer, text, sqliteTable, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	name: text('name'),
	email: text('email'),
	password: text('password'),
	warehouseId: text('warehouseId'),
	darkMode: integer('darkMode', { mode: 'boolean' }),
	createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const usersRelations = relations(users, ({ many }) => ({
	productsInShipmentOrders: many(shipmentOrders),
}));

export const warehouses = sqliteTable('warehouses', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	name: text('name'),
	address: text('address'),
	createdAt: text("createdAt").default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: text("updatedAt").default(sql`(CURRENT_TIMESTAMP)`),
});

export const warehousesRelations = relations(warehouses, ({ many }) => ({
	shipmentOrders: many(shipmentOrders),
}));

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

export const shipmentOrders = sqliteTable('shipmentOrders', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
	originId: integer('originId').references(() => warehouses.id),
	destinationId: integer('destinationId').references(() => warehouses.id),
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
	fulfilledBy: integer('fulfilledBy').references(() => users.id),
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse= typeof warehouses.$inferInsert;

export type ShipmentOrder = typeof shipmentOrders.$inferSelect;
export type NewShipmentOrder = typeof shipmentOrders.$inferInsert;

export type ProductsInShipmentOrders = typeof productsInShipmentOrders.$inferSelect;
export type NewProductsInShipmentOrders = typeof productsInShipmentOrders.$inferInsert;