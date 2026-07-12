"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--graphite)] px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-sm bg-[var(--amber)] flex items-center justify-center font-mono-tag font-bold text-[var(--graphite)] text-sm">
            AF
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-none">AssetFlow</div>
            <div className="font-mono-tag text-[10px] text-[var(--text-dim)] tracking-widest uppercase">
              Asset &amp; Resource Management
            </div>
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold mb-1">Create account</h1>
        <p className="text-[var(--text-dim)] text-sm mb-8">
          New accounts start as Employees. An admin can promote your role later.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono-tag uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
              Full name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--slate)] border border-[var(--border)] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--amber)]"
              placeholder="Priya Sharma"
            />
          </div>
          <div>
            <label className="block text-xs font-mono-tag uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--slate)] border border-[var(--border)] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--amber)]"
              placeholder="you@organization.com"
            />
          </div>
          <div>
            <label className="block text-xs font-mono-tag uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--slate)] border border-[var(--border)] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--amber)]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[var(--danger)] text-sm border-l-2 border-[var(--danger)] pl-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--amber)] text-[var(--graphite)] font-semibold rounded-sm py-2.5 text-sm hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-[var(--text-dim)] mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--amber)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
