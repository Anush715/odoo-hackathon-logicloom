"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--graphite)] px-4">
      <div className="w-full max-w-sm">
        {/* Signature: asset-tag-styled logo mark */}
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

        <h1 className="font-display text-2xl font-bold mb-1">Sign in</h1>
        <p className="text-[var(--text-dim)] text-sm mb-8">
          Access your organization&apos;s asset console.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono-tag uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--slate)] border border-[var(--border)] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--amber)] transition-colors"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--slate)] border border-[var(--border)] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--amber)] transition-colors"
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-[var(--text-dim)] mt-6 text-center">
          New here?{" "}
          <Link href="/signup" className="text-[var(--amber)] hover:underline">
            Create an employee account
          </Link>
        </p>
      </div>
    </div>
  );
}
