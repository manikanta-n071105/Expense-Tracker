"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PlusCircle, Edit, Trash2, Wallet } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  note: string;
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [token, setToken] = useState<string | null>(null);

  // Fetch transactions
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    console.log("JWT token:", storedToken);

    if (storedToken) {
      fetchTransactions(storedToken);
    } else {
      console.warn("No token found. Please log in.");
      // Optionally redirect to login page here
    }
  }, []);

  const fetchTransactions = async (jwt: string) => {
    try {
      const res = await axios.get("/api/transactions", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  };

  const handleAddTransaction = async () => {
    if (!token) return;
    try {
      const res = await axios.post(
        "/api/transactions",
        { type, category, amount, note, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTransactions([res.data.transaction, ...transactions]);
      setCategory("");
      setAmount("");
      setNote("");
      setDate("");
    } catch (err) {
      console.error("Failed to add transaction", err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!token) return;
    try {
      await axios.delete("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
        data: { id },
      });
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete transaction", err);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6 text-gray-900">
        <Wallet className="text-blue-600" /> Transactions
      </h1>

      {/* Form */}
      <div className="bg-white shadow p-4 rounded-2xl mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-900">
          Add Transaction
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-2 border rounded-lg text-gray-900"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded-lg text-gray-900 placeholder-gray-600"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-2 border rounded-lg text-gray-900 placeholder-gray-600"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border rounded-lg text-gray-900"
          />
        </div>
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="p-2 border rounded-lg w-full mb-3 text-gray-900 placeholder-gray-600"
        />
        <button
          onClick={handleAddTransaction}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700"
        >
          <PlusCircle size={18} /> Add
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between bg-white shadow p-4 rounded-2xl"
          >
            <div>
              <p className="font-semibold text-gray-900">
                {t.category} - {t.type}
              </p>
              <p className="text-lg text-gray-900">₹{t.amount}</p>
              {t.note && <p className="text-gray-800">{t.note}</p>}
              <p className="text-sm text-gray-700">
                {new Date(t.date).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="text-yellow-600 hover:text-yellow-700">
                <Edit size={18} />
              </button>
              <button
                onClick={() => handleDeleteTransaction(t.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
