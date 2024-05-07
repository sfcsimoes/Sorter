import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest, res: NextResponse) {
  const data = await req.json();
  const userObject = z.object({
    email: z.string().min(6),
    password: z.string().min(6),
  });

  try {
    let user = userObject.parse(data);
    let result = await db.query.users.findFirst({
      where: (users, { eq }) =>
        // eq(users.email, user.email) && eq(users.password, user.password),
        eq(users.email, user.email),
    });
    if (result) {
      if (bcrypt.compareSync(user.password, result.password)) {
        return NextResponse.json({
          id: result.id,
          name: result.name,
          email: result.email,
          settings: result.settings,
        });
      }
    }
    return NextResponse.json(
      { message: "Invalid Credentials" },
      {
        status: 401,
      },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid Object", error: error },
      {
        status: 400,
      },
    );
  }
}
