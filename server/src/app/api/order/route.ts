import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { z } from "zod";
import { productsInShipmentOrders, shipmentOrders } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id');

  if (id) {
    const shipmentOrders = await db.query.shipmentOrders.findFirst(
      {
        where: (shipmentOrders, { eq }) => eq(shipmentOrders.id, parseFloat(id)),
        with: {
          productsInShipmentOrders: {
            with: {
              product: true,
              transportationBox: true
            },
          }
        },
      });
    return NextResponse.json(shipmentOrders);
  }
  return NextResponse.json([]);

}


export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();
  const productSchema = z.object({
    id: z.string(),
    name: z.string().min(3),
    ean: z.string().min(2),
    units: z.number().min(1),
  });

  const orderObject = z.object({
    originId: z.string(),
    destinationId: z.string(),
    statusId: z.string(),
    products: z.array(productSchema),
  });

  await db.transaction(async (tx) => {
    try {
      orderObject.parse(data);
      var shipmentOrderId = await tx
        .insert(shipmentOrders)
        .values({
          originId: parseInt(data.originId),
          destinationId: parseInt(data.destinationId),
          statusId: parseInt(data.statusId),
        })
        .returning({ insertedId: shipmentOrders.id });


      data.products.forEach(async (i: any) => {
        await tx.insert(productsInShipmentOrders).values({
          units: i.units,
          productId: i.id,
          fulfilledBy: 1,
          isInTransportationBox: false,
          shipmentOrderId: shipmentOrderId[0]?.insertedId,
        });
      });
    } catch (error) {
      await tx.rollback();
      return NextResponse.json({ message: "Invalid Object" });
    }
  });
  return NextResponse.json({ message: "Success" });
}

export async function PUT(req: NextRequest, res: NextResponse) {
  const data = await req.json();
  const productSchema = z.object({
    id: z.number(),
    shipmentOrderId: z.number(),
    productId: z.number(),
    units: z.number().min(1),
    isInTransportationBox: z.boolean(),
    transportationBoxId: z.number().nullable()
  });

  const orderObject = z.object({
    id: z.number(),
    originId: z.number(),
    destinationId: z.number(),
    statusId: z.number(),
    synchronizationId: z.string(),
    updatedAt: z.string(),
    productsInShipmentOrders: z.array(productSchema),
  });

  await db.transaction(async (tx) => {
    try {
      var order = orderObject.parse(data);
      var shipmentOrderId = await tx.update(shipmentOrders)
        .set({
          statusId: order.statusId,
          updatedAt: order.updatedAt,
          synchronizationId: order.synchronizationId
        })
        .where(eq(shipmentOrders.id, order.id))
        .returning({ updatedId: shipmentOrders.id });

      order.productsInShipmentOrders.forEach(async (product) => {

        await tx.update(productsInShipmentOrders)
          .set({
            isInTransportationBox: product.isInTransportationBox,
            transportationBoxId: product.transportationBoxId,
          })
          .where(eq(productsInShipmentOrders.id, product.id))
      
      });

    } catch (error) {
      await tx.rollback();
      return NextResponse.json({ message: "Invalid Object" });
    }
  });
  return NextResponse.json({ message: "Success" });
}
