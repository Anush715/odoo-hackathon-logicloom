"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

export default function NewAssetPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    serialNumber: "",
    acquisitionDate: "",
    acquisitionCost: "",
    condition: "Good",
    location: "",
    isBookable: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to register asset.");
      return;
    }

    router.push("/dashboard/assets");
    router.refresh();
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-bold mb-1">Register Asset</h1>
      <p className="text-[var(--text-dim)] text-sm mb-8">
        A unique Asset Tag is generated automatically on save.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Asset name">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
            placeholder="Dell Latitude 5420"
          />
        </Field>

        <Field label="Category">
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="input"
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Serial number">
            <input
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Condition">
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="input"
            >
              <option>Good</option>
              <option>Fair</option>
              <option>Poor</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Acquisition date">
            <input
              type="date"
              value={form.acquisitionDate}
              onChange={(e) => setForm({ ...form, acquisitionDate: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Acquisition cost">
            <input
              type="number"
              value={form.acquisitionCost}
              onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })}
              className="input"
              placeholder="₹"
            />
          </Field>
        </div>

        <Field label="Location">
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
            placeholder="3rd Floor, IT Store"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isBookable}
            onChange={(e) => setForm({ ...form, isBookable: e.target.checked })}
            className="accent-[var(--amber)]"
          />
          Shared / bookable resource
        </label>

        {error && (
          <p className="text-[var(--danger)] text-sm border-l-2 border-[var(--danger)] pl-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-[var(--amber)] text-[var(--graphite)] font-medium px-5 py-2.5 rounded-sm text-sm hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? "Registering…" : "Register Asset"}
          </button>
        </div>
      </form>

      <style jsx global>{`
        .input {
          width: 100%;
          background: var(--slate);
          border: 1px solid var(--border);
          border-radius: 2px;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
        }
        .input:focus {
          outline: none;
          border-color: var(--amber);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-mono-tag uppercase tracking-wider text-[var(--text-dim)] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
