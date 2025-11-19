import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Define JWT payload type
interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// Define transaction body type
interface TransactionBody {
  id?: string;
  type: string;
  category: string;
  amount: number | string;
  note?: string;
  date: string;
}

// Extract user ID from Authorization header
const getUserIdFromHeader = (req: Request): string | null => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    return payload.userId;
  } catch {
    return null;
  }
};

// GET all transactions
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST a new transaction
export async function POST(request: Request) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as TransactionBody;
    const { type, category, amount, note, date } = body;

    if (!type || !category || !amount || !date)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        category,
        amount: Number(amount),
        note: note || "",
        date: new Date(date),
      },
    });

    return NextResponse.json(
      { message: "Transaction created", transaction },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT/update a transaction
export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as TransactionBody;
    const { id, type, category, amount, note, date } = body;

    if (!id || !type || !category || !amount || !date)
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );

    const transaction = await prisma.transaction.updateMany({
      where: { id, userId },
      data: {
        type,
        category,
        amount: Number(amount),
        note: note || "",
        date: new Date(date),
      },
    });

    return NextResponse.json(
      { message: "Transaction updated", transaction },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE a transaction
export async function DELETE(request: Request) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as { id?: string };
    if (!body.id)
      return NextResponse.json(
        { error: "Transaction ID required" },
        { status: 400 }
      );

    await prisma.transaction.deleteMany({
      where: { id: body.id, userId },
    });

    return NextResponse.json(
      { message: "Transaction deleted" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
