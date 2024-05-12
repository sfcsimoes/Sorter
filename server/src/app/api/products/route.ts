import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { z } from "zod";
import { products } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
    return NextResponse.json(await db.query.products.findMany());
}

export async function POST(req: NextRequest, res: NextResponse) {
    const data = await req.json();
    const productObject = z.object({ name: z.string().min(4), ean: z.string().min(12), isTransportationBox: z.boolean() });

    try {
        productObject.parse(data);
        await db.insert(products).values({
            name: data.name,
            ean: data.ean,
            isTransportationBox: data.isTransportationBox
        });
        return NextResponse.json({ message: 'Success' });
    } catch (error) {
        return NextResponse.json({ message: 'Invalid Object', error: error });
    }
}

export async function PUT(req: NextRequest, res: NextResponse) {
    const data = await req.json();
    const productObject = z.object({ id: z.number(), name: z.string().min(4) });

    try {
        var product = productObject.parse(data);
        await db.update(products).set({
            name: product.name,
        })
            .where(eq(products.id, product.id))
        return NextResponse.json({ message: 'Success' });
    } catch (error) {
        return NextResponse.json({ message: 'Invalid Object' });
    }
}

