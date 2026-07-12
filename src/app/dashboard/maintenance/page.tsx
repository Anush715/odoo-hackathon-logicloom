"use client";

import { useState } from "react";

const initialRequests = [
  {
    id: 1,
    asset: "Dell Laptop",
    issue: "Screen flickering issue",
    priority: "High",
    status: "Open",
    date: "12 July 2026",
  },
  {
    id: 2,
    asset: "MacBook Pro",
    issue: "Battery replacement required",
    priority: "Medium",
    status: "In Progress",
    date: "10 July 2026",
  },
];

export default function MaintenancePage() {
  const [requests, setRequests] = useState(initialRequests);

  const [form, setForm] = useState({
    asset: "",
    issue: "",
    priority: "Low",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.asset || !form.issue) return;

    setRequests([
      ...requests,
      {
        id: requests.length + 1,
        asset: form.asset,
        issue: form.issue,
        priority: form.priority,
        status: "Open",
        date: new Date().toLocaleDateString(),
      },
    ]);

    setForm({
      asset: "",
      issue: "",
      priority: "Low",
    });
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Maintenance Requests
        </h1>
        <p className="text-gray-500">
          Track and manage asset maintenance issues
        </p>
      </div>


      {/* Create Request */}
      <div className="bg-white rounded-xl shadow p-5">

        <h2 className="font-semibold mb-4">
          Create Maintenance Request
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 gap-4"
        >

          <input
            className="border rounded-lg p-3"
            placeholder="Asset Name"
            value={form.asset}
            onChange={(e) =>
              setForm({
                ...form,
                asset: e.target.value,
              })
            }
          />


          <select
            className="border rounded-lg p-3"
            value={form.priority}
            onChange={(e) =>
              setForm({
                ...form,
                priority: e.target.value,
              })
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>


          <textarea
            className="border rounded-lg p-3 md:col-span-2"
            placeholder="Describe the issue"
            rows={4}
            value={form.issue}
            onChange={(e) =>
              setForm({
                ...form,
                issue: e.target.value,
              })
            }
          />


          <button
            className="bg-black text-white rounded-lg px-5 py-3 md:col-span-2"
          >
            Submit Request
          </button>

        </form>

      </div>



      {/* Request History */}
      <div className="bg-white rounded-xl shadow">

        <div className="p-5 border-b">
          <h2 className="font-semibold">
            Maintenance History
          </h2>
        </div>


        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="border-b text-left">

                <th className="p-4">
                  Asset
                </th>

                <th className="p-4">
                  Issue
                </th>

                <th className="p-4">
                  Priority
                </th>

                <th className="p-4">
                  Status
                </th>

                <th className="p-4">
                  Date
                </th>

              </tr>
            </thead>


            <tbody>

              {requests.map((request) => (

                <tr
                  key={request.id}
                  className="border-b"
                >

                  <td className="p-4">
                    {request.asset}
                  </td>

                  <td className="p-4">
                    {request.issue}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        request.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : request.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {request.priority}
                    </span>

                  </td>

                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {request.status}
                    </span>
                  </td>

                  <td className="p-4">
                    {request.date}
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