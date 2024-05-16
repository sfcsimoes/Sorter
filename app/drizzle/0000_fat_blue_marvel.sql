CREATE TABLE `orderStatus` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`synchronizationId` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`ean` text,
	`isTransportationBox` integer,
	`synchronizationId` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `productsInShipmentOrders` (
	`id` integer PRIMARY KEY NOT NULL,
	`shipmentOrderId` integer,
	`productId` integer,
	`units` integer,
	`isInTransportationBox` integer,
	`transportationBoxId` integer,
	FOREIGN KEY (`shipmentOrderId`) REFERENCES `shipmentOrders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transportationBoxId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shipmentOrders` (
	`id` integer PRIMARY KEY NOT NULL,
	`originId` integer,
	`destinationId` integer,
	`statusId` integer,
	`synchronizationId` text,
	`fulfilledById` integer,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`originId`) REFERENCES `warehouses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`destinationId`) REFERENCES `warehouses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`statusId`) REFERENCES `orderStatus`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`fulfilledById`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `syncOrders` (
	`id` integer PRIMARY KEY NOT NULL,
	`shipmentOrderId` integer,
	`synced` text,
	FOREIGN KEY (`shipmentOrderId`) REFERENCES `shipmentOrders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`settings` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`address` text,
	`synchronizationId` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP)
);
