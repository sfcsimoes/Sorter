import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(request: NextRequest) {
    return NextResponse.json(await db.query.orderStatus.findMany());
}