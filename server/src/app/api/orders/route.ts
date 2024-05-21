import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { z } from "zod";
import { productsInShipmentOrders, shipmentOrders } from "@/server/db/schema";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id');

  if (id) {
    const orders = await db.query.shipmentOrders.findMany({
      with: {
        productsInShipmentOrders: true,
        fulfilledBy: true
      },
      where: (shipmentOrders, { eq }) => eq(shipmentOrders.originId, parseFloat(id)),
      orderBy: [desc(shipmentOrders.id)],
    });
    return NextResponse.json(orders);
  } else {
    const orders = await db.query.shipmentOrders.findMany({
      with: {
        productsInShipmentOrders: true,
        fulfilledBy: true
      },
      orderBy: [desc(shipmentOrders.id)],

    });
    return NextResponse.json(orders);
  }
}


export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();
  const filterSchema = z.object({
    page: z.number(),
    limit: z.number(),
  });

  try {
    var filter = filterSchema.parse(data);
    const orders = await db.query.shipmentOrders.findMany({
      with: {
        productsInShipmentOrders: true,
        fulfilledBy: true
      },
      offset: (filter.limit * (filter.page - 1)),
      limit: filter.limit,
      orderBy: [desc(shipmentOrders.id)],
    });

    return NextResponse.json(orders);
  } catch (e) {
    return NextResponse.json({ message: 'Invalid Filter' }, { status: 500 });

  }



}
