import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { z } from "zod";
import { productsInShipmentOrders, shipmentOrders } from "@/server/db/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id');

  if (id) {
    const shipmentOrders = await db.query.shipmentOrders.findMany({
      with: {
        productsInShipmentOrders: true,
        fulfilledBy: true
      },
      where: (shipmentOrders, { eq }) => eq(shipmentOrders.originId, parseFloat(id)),
    });
    return NextResponse.json(shipmentOrders);
  }else{
    const shipmentOrders = await db.query.shipmentOrders.findMany({
      with: {
        productsInShipmentOrders: true,
        fulfilledBy: true
      },
    });
    return NextResponse.json(shipmentOrders);
  }
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
    fulfilledById: z.number(),
    products: z.array(productSchema),
  });

  await db.transaction(async (tx) => {
    try {
      let order = orderObject.parse(data);
      var shipmentOrderId = await tx
        .insert(shipmentOrders)
        .values({
          originId: parseInt(order.originId),
          destinationId: parseInt(order.destinationId),
          statusId: parseInt(order.statusId),
        })
        .returning({ insertedId: shipmentOrders.id });


      data.products.forEach(async (i: any) => {
        await tx.insert(productsInShipmentOrders).values({
          units: i.units,
          productId: i.id,
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
