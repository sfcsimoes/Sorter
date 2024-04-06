import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import {
	products,
	stores,
	shipmentOrders,
	productsInShipmentOrders,
	type Product,
	type NewProduct,
	type Store,
	type NewStore,
	type ShipmentOrder,
	type NewShipmentOrder,
	type ProductsInShipmentOrders,
	type NewProductsInShipmentOrders,
} from './schema';

const sqlite = new Database('./db/demo.db');
const db = drizzle(sqlite);

async function addProduct(product: NewProduct): Promise<Product> {
	return (await db.insert(products).values(product).returning()).at(0)!;
}

async function addShipmentOrders(shipmentOrder: NewShipmentOrder): Promise<ShipmentOrder> {
	return (await db.insert(shipmentOrders).values(shipmentOrder).returning()).at(0)!;
}

async function addStore(store: NewStore): Promise<Store> {
	return (await db.insert(stores).values(store).returning()).at(0)!;
}

async function addProductsInShipmentOrders(productsInShipmentOrder: NewProductsInShipmentOrders): Promise<ProductsInShipmentOrders> {
	return (await db.insert(productsInShipmentOrders).values(productsInShipmentOrder).returning()).at(0)!;
}

const productList = [{
	name: 'PenDrive',
	ian: '1',
	sku: "pd",
	isTransportationBox: false
},
{
	name: 'Cartão Presente',
	ian: '2',
	sku: "cp",
	isTransportationBox: false
},
{
	name: 'Caixa 1',
	ian: '3',
	sku: "c",
	isTransportationBox: true
}];
const addedProductList = [];
productList.forEach(product => {
	addedProductList.push(addProduct(product));
});

const storeList = [{
	name: 'Coimbra',
},
{
	name: 'Lisboa',
}];
const addedStoreList = [];
storeList.forEach(store => {
	addedStoreList.push(addStore(store));
});

const addedShipmentOrdersList = [];
addedShipmentOrdersList.push(addShipmentOrders({ status: 'Pendente', store: 1 }));
addedShipmentOrdersList.push(addShipmentOrders({ status: 'Pendente', store: 2 }));


const addedShipmentOrderWithTransportationBoxes = [];
addedShipmentOrderWithTransportationBoxes.push(addProductsInShipmentOrders({ shipmentOrder: 2, product: 1, units: 2, isInTransportationBox: false }));
addedShipmentOrderWithTransportationBoxes.push(addProductsInShipmentOrders({ shipmentOrder: 2, product: 2, units: 2, isInTransportationBox: false }));



// async function addUser(user: NewUser): Promise<User> {
// 	return (await db.insert(users).values(user).returning()).at(0)!;
// }

// async function addIdea(idea: NewIdea) {
// 	await db.insert(ideas).values(idea);
// }

// async function getIdeas() {
// 	return await db
// 		.select({
// 			id: ideas.id,
// 			text: ideas.text,
// 			status: ideas.status,
// 			creator: users.name,
// 		})
// 		.from(ideas)
// 		.leftJoin(users, eq(ideas.creator, users.id));
// }

// const user = await addUser({ name: 'Jane Developer' });

// await addIdea({
// 	text: 'Learn how ORMs work',
// 	status: 'pending',
// 	creator: user.id,
// });

// const allIdeas = await getIdeas();

// console.log(allIdeas);
