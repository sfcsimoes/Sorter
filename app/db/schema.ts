import { relations, sql } from "drizzle-orm";
import {
	int,
	primaryKey,
	sqliteTableCreator,
	text,
} from "drizzle-orm/sqlite-core";
import uuid from 'react-native-uuid';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `${name}`);

export const users = createTable('users', {
	id: int('id', { mode: 'number' }).primaryKey(),
	name: text('name').notNull(),
	createdAt: text("createdAt").default(sql`(datetime('now'))`),
	updatedAt: text("updatedAt").default(sql`(datetime('now'))`),
});

export const usersRelations = relations(users, ({ many }) => ({
	shipmentOrders: many(shipmentOrders),
}));

export const warehouses = createTable('warehouses', {
	id: int('id', { mode: 'number' }).primaryKey(),
	name: text('name'),
	address: text('address'),
	synchronizationId: text("synchronizationId").$defaultFn(() => uuid.v4().toString()),
	createdAt: text("createdAt").default(sql`(datetime('now'))`),
	updatedAt: text("updatedAt").default(sql`(datetime('now'))`),
});

export const warehousesRelations = relations(warehouses, ({ many }) => ({
	shipmentOrders: many(shipmentOrders),
}));

export const products = createTable('products', {
	id: int('id', { mode: 'number' }).primaryKey(),
	name: text('name'),
	ean: text('ean'),
	isTransportationBox: int('isTransportationBox', { mode: 'boolean' }),
	synchronizationId: text("synchronizationId").$defaultFn(() => uuid.v4().toString()),
	createdAt: text("createdAt").default(sql`(datetime('now'))`),
	updatedAt: text("updatedAt").default(sql`(datetime('now'))`),
});

export const productsRelations = relations(products, ({ many }) => ({
	productsInShipmentOrders: many(productsInShipmentOrders),
}));

export const orderStatus = createTable('orderStatus', {
	id: int('id', { mode: 'number' }).primaryKey(),
	name: text('name'),
	synchronizationId: text("synchronizationId").$defaultFn(() => uuid.v4().toString()),
	createdAt: text("createdAt").default(sql`(datetime('now'))`),
	updatedAt: text("updatedAt").default(sql`(datetime('now'))`),
});

export const orderStatusRelations = relations(orderStatus, ({ many }) => ({
	shipmentOrders: many(shipmentOrders),
}));

export const shipmentOrders = createTable('shipmentOrders', {
	id: int('id', { mode: 'number' }).primaryKey(),
	originId: int('originId').references(() => warehouses.id),
	destinationId: int('destinationId').references(() => warehouses.id),
	statusId: int('statusId').references(() => orderStatus.id),
	synchronizationId: text("synchronizationId").$defaultFn(() => uuid.v4().toString()),
	fulfilledById: int('fulfilledById').references(() => users.id),
	createdAt: text("createdAt").default(sql`(datetime('now'))`),
	updatedAt: text("updatedAt").default(sql`(datetime('now'))`),
});

export const shipmentOrdersRelations = relations(shipmentOrders, ({ one, many }) => ({
	productsInShipmentOrders: many(productsInShipmentOrders),
	syncOrders: many(syncOrders),
	originId: one(warehouses, {
		fields: [shipmentOrders.originId],
		references: [warehouses.id],
	}),
	destinationId: one(warehouses, {
		fields: [shipmentOrders.destinationId],
		references: [warehouses.id],
	}),
	statusId: one(orderStatus, {
		fields: [shipmentOrders.statusId],
		references: [orderStatus.id],
	}),
	fulfilledBy: one(users, {
		fields: [shipmentOrders.fulfilledById],
		references: [users.id],
	}),
}));

export const productsInShipmentOrders = createTable('productsInShipmentOrders', {
	id: int('id', { mode: 'number' }).primaryKey(),
	shipmentOrderId: int('shipmentOrderId').references(() => shipmentOrders.id),
	productId: int('productId').references(() => products.id),
	units: int('units'),
	isInTransportationBox: int('isInTransportationBox', { mode: 'boolean' }),
	transportationBoxId: int('transportationBoxId').references(() => products.id),
});

export const productsInShipmentOrdersRelations = relations(productsInShipmentOrders, ({ one }) => ({
	product: one(products, {
		fields: [productsInShipmentOrders.productId],
		references: [products.id],
	}),
	shipmentOrders: one(shipmentOrders, {
		fields: [productsInShipmentOrders.shipmentOrderId],
		references: [shipmentOrders.id],
	}),
	transportationBox: one(products, {
		fields: [productsInShipmentOrders.transportationBoxId],
		references: [products.id],
	})
}));


export const syncOrders = createTable('syncOrders', {
	id: int('id', { mode: 'number' }).primaryKey(),
	shipmentOrderId: int('shipmentOrderId').references(() => shipmentOrders.id),
	synced: text('synced'),
});

export const syncOrdersRelations = relations(syncOrders, ({ one }) => ({
	shipmentOrders: one(shipmentOrders, {
		fields: [syncOrders.shipmentOrderId],
		references: [shipmentOrders.id],
	}),
}));

