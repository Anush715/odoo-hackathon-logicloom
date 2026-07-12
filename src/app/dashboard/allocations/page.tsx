"use client";

import { useState } from "react";

const initialAllocations = [
  {
    id: 1,
    asset: "Dell Laptop",
    employee: "Harshita",
    department: "Development",
    date: "12 July 2026",
    status: "Active",
  },
  {
    id: 2,
    asset: "MacBook Pro",
    employee: "Anushka",
    department: "Design",
    date: "10 July 2026",
    status: "Active",
  },
];

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState(initialAllocations);

  const [form, setForm] = useState({
    asset: "",
    employee: "",
    department: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.asset || !form.employee) return;

    setAllocations([
      ...allocations,
      {
        id: allocations.length + 1,
        asset: form.asset,
        employee: form.employee,
        department: form.department,
        date: new Date().toLocaleDateString(),
        status: "Active",
      },
    ]);

    setForm({
      asset: "",
      employee: "",
      department: "",
    });
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Asset Allocations
        </h1>
        <p className="text-gray-500">
          Manage assigned assets to employees
        </p>
      </div>


      {/* Allocation Form */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold mb-4">
          Create Allocation
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-3 gap-4"
        >

          <input
            className="border rounded-lg p-3"
            placeholder="Asset Name"
            value={form.asset}
            onChange={(e)=>setForm({
              ...form,
              asset:e.target.value
            })}
          />

          <input
            className="border rounded-lg p-3"
            placeholder="Employee Name"
            value={form.employee}
            onChange={(e)=>setForm({
              ...form,
              employee:e.target.value
            })}
          />

          <input
            className="border rounded-lg p-3"
            placeholder="Department"
            value={form.department}
            onChange={(e)=>setForm({
              ...form,
              department:e.target.value
            })}
          />

          <button
            className="bg-black text-white rounded-lg px-5 py-3 md:col-span-3"
          >
            Allocate Asset
          </button>

        </form>
      </div>



      {/* Allocation List */}
      <div className="bg-white rounded-xl shadow">

        <div className="p-5 border-b">
          <h2 className="font-semibold">
            Allocation History
          </h2>
        </div>


        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b text-left">
                <th className="p-4">Asset</th>
                <th className="p-4">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>


            <tbody>

            {allocations.map((item)=>(
              <tr
                key={item.id}
                className="border-b"
              >

                <td className="p-4">
                  {item.asset}
                </td>

                <td className="p-4">
                  {item.employee}
                </td>

                <td className="p-4">
                  {item.department}
                </td>

                <td className="p-4">
                  {item.date}
                </td>

                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    {item.status}
                  </span>
                </td>

              </tr>
            ))}

            </tbody>

          </table>

        </div>

      </div>


    </div>
  );
}
