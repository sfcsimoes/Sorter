import * as schema from '../db/schema';
// import { drizzle } from 'drizzle-orm';
import express from 'express'
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';

const sqlite = new Database('./db/demo.db');
const db = drizzle(sqlite, { schema });

const app = express()

app.use(express.json())


app.get('/warehouses', async (req, res) => {
  const users = await db.query.warehouses.findMany();
  res.json(users)
})

app.get('/products', async (req, res) => {
  const users = await db.query.products.findMany();
  res.json(users)
})

app.get('/product/:id', async (req, res) => {
  const { id } = req.params;

  const product = await db.query.products
    .findFirst({
      where: (products, { eq }) => eq(products.id, parseFloat(id)),
    });

  res.json(product)
});

app.get('/shipmentOrders', async (req, res) => {
  const shipmentOrders = await db.query.shipmentOrders.findMany({
    with: {
      productsInShipmentOrders: true,
    },
  });
  res.json(shipmentOrders)
})

app.get('/shipmentOrders/:id', async (req, res) => {
  const { id } = req.params;
  const shipmentOrders = await db.query.shipmentOrders.findMany(
    {
      where: (shipmentOrders, { eq }) => eq(shipmentOrders.originId, parseFloat(id)),
      with: {
        productsInShipmentOrders: {
          with: {
            products: true
          },
        },
      },
    });
  res.json(shipmentOrders)
})

app.get('/shipmentOrder/:id', async (req, res) => {
  const { id } = req.params;

  const shipmentOrders = await db.query.shipmentOrders.findFirst(
    {
      where: (shipmentOrders, { eq }) => eq(shipmentOrders.id, parseFloat(id)),
      with: {
        productsInShipmentOrders: {
          with: {
            products: true
          },
        },
      },
    });
  res.json(shipmentOrders)
})

app.put('/shipmentOrders/:id', async (req, res) => {
  const { id } = req.params;

  await db.update(schema.shipmentOrders)
    .set({ status: 'Concluida' })
    .where(eq(schema.shipmentOrders.id, parseFloat(id)));

    res.json("Ok")
})


// app.post(`/shipmentOrder`, async (req, res) => {
//   const { storeId, transportaionBoxId, productId, units } = req.body;

//   let result;
//   if (transportaionBoxId) {
//     result = await prisma.shipmentOrder.create({
//       data: {
//         storeId: storeId,
//         productId: transportaionBoxId,
//         statusId: 1,
//         transportionBox: {
//           create:
//           {
//             productId: productId,
//             units: units
//           },
//         },
//       },
//     })
//   } else {
//     result = await prisma.shipmentOrder.create({
//       data: {
//         storeId: storeId,
//         productId: productId,
//         statusId: 1,
//       },
//     })
//   }

//   res.json(result)
// })

const server = app.listen(3100, () =>
  console.log(`
🚀 Server ready at: http://localhost:3100`),
)
