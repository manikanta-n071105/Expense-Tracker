"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, CheckCircle, XCircle } from "lucide-react";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [modal, setModal] = useState<{ open: boolean; success?: boolean; message?: string }>({
    open: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openModal = (success: boolean, message: string) =>
    setModal({ open: true, success, message });
  const closeModal = () => setModal({ open: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      openModal(false, "Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        openModal(true, data.message || "User created successfully.");
        setForm({ name: "", email: "", password: "" });
        router.push("/auth/signin");
      } else {
        openModal(false, data.error || "Something went wrong.");
      }
    } catch (err) {
      openModal(false, "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white font-sans">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-emerald-700">Create your account</h1>
          <p className="text-black mt-1">Join and start managing transactions.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <label className="block">
            <span className="text-sm font-medium text-black">Full Name</span>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-black" />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="pl-10 pr-3 py-3 w-full rounded-lg border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-black"
                placeholder="Your full name"
              />
            </div>
          </label>

          {/* Email */}
          <label className="block">
            <span className="text-sm font-medium text-black">Email</span>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-black" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="pl-10 pr-3 py-3 w-full rounded-lg border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-black"
                placeholder="you@example.com"
              />
            </div>
          </label>

          {/* Password */}
          <label className="block">
            <span className="text-sm font-medium text-black">Password</span>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-black" />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="pl-10 pr-3 py-3 w-full rounded-lg border border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-black"
                placeholder="Create a password"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-center text-black">
          Already have an account?{" "}
          <a className="text-emerald-700 font-medium" href="/auth/signin">
            Sign in
          </a>
        </div>
      </div>

      {/* Modal popup */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          <div className="relative bg-white rounded-xl shadow-2xl w-11/12 max-w-sm p-6">
            <div className="flex items-center gap-4">
              {modal.success ? (
                <CheckCircle className="w-10 h-10 text-green-500" />
              ) : (
                <XCircle className="w-10 h-10 text-red-500" />
              )}

              <div>
                <h3 className="text-lg font-semibold">{modal.success ? "Success" : "Oops"}</h3>
                <p className="text-sm text-black mt-1">{modal.message}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
