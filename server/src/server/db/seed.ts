import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
// import { env } from "@/env";
import * as schema from "./schema";
import { users, orderStatus, warehouses, products, shipmentOrders, productsInShipmentOrders } from "@/server/db/schema";
import bcrypt from "bcryptjs";

const client = createClient({ url: 'file:db.sqlite', authToken: 'DATABASE_AUTH_TOKEN' });
export const db = drizzle(client, { schema });

const hashedPassword = await bcrypt.hash("123456789", 10);

var userId = await db.insert(users).values({
  name: "admin",
  email: "admin@email.com",
  password: hashedPassword,
}).returning({ insertedId: users.id });

await db.insert(orderStatus).values([
  { name: "Pending" },
  { name: "Fulfilled" },
  { name: "Canceled" },
]);

await db.insert(warehouses).values([
  {
    name: "Worten Eiras (Outlet)",
    address:
      "Estrada da Ribeira de Eiras - Coimbra Retail Park Loja 4 e 5 3020-497",
  },
  {
    name: "Entreposto Logístico - Azambuja",
    address: "Edifício Plaza II, EN 3, Km 7 – Arneiro, 2050-306 Azambuja",
  },
  {
    name: "Worten Via Catarina",
    address:
      "Shopping Via Catarina - Loja 1.20, Rua Santa Catarina 312 4000-433",
  },
  {
    name: "Worten - Lousã",
    address:
      "Av. Dr. José Maria Cardoso, 3200-254 Lousã",
  },
  {
    name: "Worten - Figueira da Foz",
    address:
      "Av. Prof. Dr. Bissaya Barreto, 3080-897 Figueira da Foz",
  },
]);

await db.insert(products).values([
  {
    name: "PenDrive",
    ean: "10000000000",
    isTransportationBox: false,
  },
  {
    name: "Cartão Presente",
    ean: "20000000000",
    isTransportationBox: false,
  },
  {
    name: "Playstation 5",
    ean: "30000000000",
    isTransportationBox: false,
  },
  {
    name: "Iphone 15",
    ean: "40000000000",
    isTransportationBox: false,
  },
  {
    name: "Caixa 1",
    ean: "99100000000",
    isTransportationBox: true,
  },
  {
    name: "Caixa 2",
    ean: "99200000000",
    isTransportationBox: true,
  },
  {
    name: "Caixa 3",
    ean: "99300000000",
    isTransportationBox: true,
  },
]);


await db.insert(shipmentOrders).values([
  {
    originId: 1,
    destinationId: 2,
    statusId: 1,
  },
  {
    originId: 1,
    destinationId: 3,
    statusId: 1,
  },
  {
    originId: 2,
    destinationId: 3,
    statusId: 1,
  }
]);


await db.insert(productsInShipmentOrders).values([
  {
    shipmentOrderId: 1,
    productId: 1,
    units: 2,
    isInTransportationBox: false,
    transportationBoxId: null
  },
  {
    shipmentOrderId: 1,
    productId: 2,
    units: 2,
    isInTransportationBox: true,
    transportationBoxId: 3
  },
  {
    shipmentOrderId: 2,
    productId: 1,
    units: 2,
    isInTransportationBox: false,
    transportationBoxId: null
  },
  {
    shipmentOrderId: 2,
    productId: 2,
    units: 2,
    isInTransportationBox: false,
    transportationBoxId: null
  },
  {
    shipmentOrderId: 3,
    productId: 1,
    units: 2,
    isInTransportationBox: true,
    transportationBoxId: 3
  },
  {
    shipmentOrderId: 3,
    productId: 2,
    units: 2,
    isInTransportationBox: true,
    transportationBoxId: 3
  },
]);




// addShipmentOrders({ status: 'Pendente', originId: 2, destinationId: 1 });

// addProductsInShipmentOrders({ shipmentOrder: 2, product: 1, units: 2, isInTransportationBox: false });
// addProductsInShipmentOrders({ shipmentOrder: 2, product: 2, units: 2, isInTransportationBox: false });
