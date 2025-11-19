import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const getUserIdFromHeader = (req: Request) => {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) return null; 
  const token = authHeader && authHeader.split(" ")[1];
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
    return payload.userId;
  } catch {
    return null;
  }
};


// GET all transactions
export async function GET(request: Request) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST a new transaction
export async function POST(request: Request) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { type, category, amount, note, date } = body;

    if (!type || !category || !amount || !date)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const transaction = await prisma.transaction.create({
      data: { userId, type, category, amount: Number(amount), note: note || "", date: new Date(date) },
    });

    return NextResponse.json({ message: "Transaction created", transaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT (update) a transaction
export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, type, category, amount, note, date } = body;

    if (!id || !type || !category || !amount || !date)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const transaction = await prisma.transaction.updateMany({
      where: { id, userId },
      data: { type, category, amount: Number(amount), note: note || "", date: new Date(date) },
    });

    return NextResponse.json({ message: "Transaction updated", transaction }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE a transaction
export async function DELETE(request: Request) {
  try {
    const userId = getUserIdFromHeader(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "Transaction ID required" }, { status: 400 });

    await prisma.transaction.deleteMany({ where: { id, userId } });

    return NextResponse.json({ message: "Transaction deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
  