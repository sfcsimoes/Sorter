import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { z } from "zod";
import { warehouses } from "@/server/db/schema";



export async function GET(request: NextRequest) {
    return NextResponse.json(await db.query.warehouses.findMany());
}

export async function POST(req: NextRequest, res: NextResponse) {
    const data = await req.json();
    const warehouseObject = z.object({ name: z.string().min(4), address: z.string().min(10)});

    try {
        warehouseObject.parse(data);
        await db.insert(warehouses).values({
            name: data.name,
            address: data.address,
        });
        return NextResponse.json({ message: 'Success' });
    } catch (error) {
        return NextResponse.json({ message: 'Invalid Object' });
    }
}


