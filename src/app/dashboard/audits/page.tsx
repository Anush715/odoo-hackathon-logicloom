"use client";
import { useState, useEffect } from "react";

export default function AuditCycles() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    scopeDept: "",
    scopeLocation: "",
    startDate: "",
    endDate: "",
    auditorIds: [] as string[],
    assetIds: [] as string[],
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await fetch("/api/audits");
    const data = await res.json();
    setCycles(data.cycles || []);
    setAssets(data.assets || []);
    setEmployees(data.employees || []);
  };

  const toggleSelection = (field: "auditorIds" | "assetIds", id: string) => {
    setForm((prev) => {
      const current = prev[field];
      const updated = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
      return { ...prev, [field]: updated };
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/audits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed to create audit cycle");
      return;
    }
    setForm({ name: "", scopeDept: "", scopeLocation: "", startDate: "", endDate: "", auditorIds: [], assetIds: [] });
    loadData();
  };

  const markItem = async (itemId: string, result: string) => {
    await fetch("/api/audits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_item", itemId, result }),
    });
    loadData();
  };

  const closeCycle = async (cycleId: string) => {
    const res = await fetch("/api/audits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close_cycle", cycleId }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to close cycle");
      return;
    }
    loadData();
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold mb-1">Audit Cycles</h1>
      <p className="text-gray-400 mb-6">Run structured verification cycles and track discrepancies</p>

      <div className="bg-white text-black rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create Audit Cycle</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Audit Cycle Name (e.g. Q3 Electronics Audit)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              className="border rounded-lg p-3"
              placeholder="Scope: Department (optional)"
              value={form.scopeDept}
              onChange={(e) => setForm({ ...form, scopeDept: e.target.value })}
            />
            <input
              className="border rounded-lg p-3"
              placeholder="Scope: Location (optional)"
              value={form.scopeLocation}
              onChange={(e) => setForm({ ...form, scopeLocation: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Start Date</label>
              <input
                type="date"
                className="w-full border rounded-lg p-3"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">End Date</label>
              <input
                type="date"
                className="w-full border rounded-lg p-3"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-2">Assign Auditors</label>
            <div className="flex flex-wrap gap-2">
              {employees.map((emp) => (
                <button
                  type="button"
                  key={emp.id}
                  onClick={() => toggleSelection("auditorIds", emp.id)}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    form.auditorIds.includes(emp.id) ? "bg-orange-500 text-white border-orange-500" : "border-gray-300"
                  }`}
                >
                  {emp.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-2">Assets in Scope</label>
            <div className="flex flex-wrap gap-2">
              {assets.map((a) => (
                <button
                  type="button"
                  key={a.id}
                  onClick={() => toggleSelection("assetIds", a.id)}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    form.assetIds.includes(a.id) ? "bg-orange-500 text-white border-orange-500" : "border-gray-300"
                  }`}
                >
                  {a.assetTag} - {a.name}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="w-full bg-black text-white rounded-lg py-3 font-semibold">
            Create Audit Cycle
          </button>
          {message && <p className="text-red-600 text-sm">{message}</p>}
        </form>
      </div>

      <div className="space-y-6">
        {cycles.map((cycle) => (
          <div key={cycle.id} className="bg-white text-black rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{cycle.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(cycle.startDate).toLocaleDateString()} → {new Date(cycle.endDate).toLocaleDateString()}
                  {cycle.scopeDept ? ` · ${cycle.scopeDept}` : ""}
                  {cycle.scopeLocation ? ` · ${cycle.scopeLocation}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    cycle.isClosed ? "bg-gray-200 text-gray-700" : "bg-green-100 text-green-700"
                  }`}
                >
                  {cycle.isClosed ? "Closed" : "Open"}
                </span>
                {!cycle.isClosed && (
                  <button
                    onClick={() => closeCycle(cycle.id)}
                    className="text-sm bg-red-600 text-white px-3 py-1 rounded-lg"
                  >
                    Close Cycle
                  </button>
                )}
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Asset</th>
                  <th>Auditor</th>
                  <th>Result</th>
                  {!cycle.isClosed && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {cycle.items.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-2">
                      {item.asset?.assetTag} - {item.asset?.name}
                    </td>
                    <td>{item.auditor?.name || "-"}</td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.result === "VERIFIED"
                            ? "bg-green-100 text-green-700"
                            : item.result === "MISSING"
                            ? "bg-red-100 text-red-700"
                            : item.result === "DAMAGED"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.result}
                      </span>
                    </td>
                    {!cycle.isClosed && (
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => markItem(item.id, "VERIFIED")} className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                            Verified
                          </button>
                          <button onClick={() => markItem(item.id, "MISSING")} className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                            Missing
                          </button>
                          <button onClick={() => markItem(item.id, "DAMAGED")} className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                            Damaged
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {cycle.discrepancies?.length > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                <strong>{cycle.discrepancies.length} discrepancy(ies) flagged</strong> — Missing/Damaged items above.
              </div>
            )}
          </div>
        ))}
        {cycles.length === 0 && <p className="text-gray-400">No audit cycles yet. Create one above.</p>}
      </div>
    </div>
  );
}