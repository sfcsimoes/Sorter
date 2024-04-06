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
	store: integer('storeId').references(() => stores.id),
	// product: integer('productId').references(() => products.id),
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

export type ShipmentOrder = typeof shipmentOrders.$inferSelect;
export type NewShipmentOrder = typeof shipmentOrders.$inferInsert;

export type ProductsInShipmentOrders = typeof productsInShipmentOrders.$inferSelect;
export type NewProductsInShipmentOrders = typeof productsInShipmentOrders.$inferInsert;

// export type ShipmentOrderWithTransportationBox = typeof shipmentOrderWithTransportationBoxes.$inferSelect;
// export type NewShipmentOrderWithTransportationBox = typeof shipmentOrderWithTransportationBoxes.$inferInsert;

// export const users = sqliteTable('users', {
// 	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
// 	name: text('name'),
// });

// export const ideas = sqliteTable('ideas', {
// 	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
// 	text: text('text'),
// 	status: text('status', { enum: ['approved', 'rejected', 'pending'] }),
// 	creator: integer('creator_id').references(() => users.id),
// });

// export type User = typeof users.$inferSelect;
// export type NewUser = typeof users.$inferInsert;

// export type Idea = typeof ideas.$inferSelect;
// export type NewIdea = typeof ideas.$inferInsert;
