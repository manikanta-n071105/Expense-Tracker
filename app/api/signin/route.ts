import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Type for JWT Payload
interface JWTPayload {
  userId: string;
  email: string;
}

export async function POST(request: Request) {
  const JWT_SECRET = process.env.JWT_SECRET!;
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and Password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid Credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Wrong Credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email } as JWTPayload,
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return NextResponse.json(
      { message: "Signin Successful", token },
      { status: 200 }
    );
  } catch {
    // Removed unused `error` → fixes ESLint warning
    return NextResponse.json(
      { message: "Internal Server Error in Signin" },
      { status: 500 }
    );
  }
}
