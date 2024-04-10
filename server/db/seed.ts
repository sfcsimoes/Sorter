import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import {
	users,
	products,
	warehouses,
	shipmentOrders,
	productsInShipmentOrders,
	type User,
	type NewUser,
	type Product,
	type NewProduct,
	type Warehouse,
	type NewWarehouse,
	type ShipmentOrder,
	type NewShipmentOrder,
	type ProductsInShipmentOrders,
	type NewProductsInShipmentOrders,
} from './schema';

const sqlite = new Database('./db/demo.db');
const db = drizzle(sqlite);

async function addUser(user: NewUser): Promise<User> {
	return (await db.insert(users).values(user).returning()).at(0)!;
}

async function addProduct(product: NewProduct): Promise<Product> {
	return (await db.insert(products).values(product).returning()).at(0)!;
}

async function addShipmentOrders(shipmentOrder: NewShipmentOrder): Promise<ShipmentOrder> {
	return (await db.insert(shipmentOrders).values(shipmentOrder).returning()).at(0)!;
}

async function addWarehouse(warehouse: NewWarehouse): Promise<Warehouse> {
	return (await db.insert(warehouses).values(warehouse).returning()).at(0)!;
}

async function addProductsInShipmentOrders(productsInShipmentOrder: NewProductsInShipmentOrders): Promise<ProductsInShipmentOrders> {
	return (await db.insert(productsInShipmentOrders).values(productsInShipmentOrder).returning()).at(0)!;
}

const user = addUser({ name: 'Jane Developer', email: 'teste@email.com', password: '123456789' });

const productList = [{
	name: 'PenDrive',
	ean: '100000000000',
	isTransportationBox: false
},
{
	name: 'Cartão Presente',
	ean: '200000000000',
	isTransportationBox: false
},
{
	name: 'Caixa 1',
	ean: '300000000000',
	isTransportationBox: true
}];

productList.forEach(product => {
	addProduct(product);
});

const warehouseList = [{
	name: 'Coimbra',
},
{
	name: 'Lisboa',
}];
warehouseList.forEach(store => {
	addWarehouse(store);
});

addShipmentOrders({ status: 'Pendente', originId: 1, destinationId: 2 });
addShipmentOrders({ status: 'Pendente', originId: 2, destinationId: 1 });

addProductsInShipmentOrders({ shipmentOrder: 2, product: 1, units: 2, isInTransportationBox: false });
addProductsInShipmentOrders({ shipmentOrder: 2, product: 2, units: 2, isInTransportationBox: false });

