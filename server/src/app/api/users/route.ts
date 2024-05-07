import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { z } from "zod";
import { users } from "@/server/db/schema";

export async function GET(request: NextRequest) {
  return NextResponse.json(await db.query.users.findMany());
}

export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();
  const userObject = z.object({
    name: z.string().min(4),
    email: z.string().min(6),
    password: z.string().min(6),
    settings: z.string().optional(),
  });

  try {
    var user = userObject.parse(data);
    await db.insert(users).values({
      name: user.name,
      email: user.email,
      password: user.password,
      settings: user.settings,
    });
    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid Object", error: error },
      {
        status: 400,
      },
    );
  }
}
