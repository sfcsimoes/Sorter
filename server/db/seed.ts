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
	// productsInShipmentOrdersOnBoxes,
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

// async function add(values: any) {
// 	return (await db.insert(productsInShipmentOrdersOnBoxes).values(values));
// }

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
	name: 'Worten Eiras (Outlet)',
	address: 'Estrada da Ribeira de Eiras - Coimbra Retail Park Loja 4 e 5 3020-497'
},
{
	name: 'Entreposto Logístico - Azambuja',
	address: 'Edifício Plaza II, EN 3, Km 7 – Arneiro, 2050-306 Azambuja'
},
{
	name: 'Worten Via Catarina',
	address: 'Shopping Via Catarina - Loja 1.20, Rua Santa Catarina 312 4000-433'
}];

warehouseList.forEach(store => {
	addWarehouse(store);
});

addShipmentOrders({ status: 'Pendente', originId: 1, destinationId: 2 });
addShipmentOrders({ status: 'Pendente', originId: 2, destinationId: 1 });

// addProductsInShipmentOrders({ shipmentOrder: 2, product: 1, units: 2, isInTransportationBox: true, transportationBox: 3 });
// addProductsInShipmentOrders({ shipmentOrder: 2, product: 2, units: 2, isInTransportationBox: false });
addProductsInShipmentOrders({ shipmentOrder: 2, productId: 1, units: 2, isInTransportationBox: true, transportationBoxId: 2 });
addProductsInShipmentOrders({ shipmentOrder: 2, productId: 2, units: 2, isInTransportationBox: false, transportationBoxId: 2 });


// add({ productsInShipmentOrdersId: 1, transportationBox: 3 });