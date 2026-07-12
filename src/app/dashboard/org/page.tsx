"use client";

import { useState } from "react";

export default function OrganizationPage() {
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgPhone, setOrgPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      orgName,
      orgEmail,
      orgPhone,
    });

    alert("Organization created successfully!");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Organization Setup
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create and manage your organization details
        </p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>

            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Enter organization name"
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={orgEmail}
              onChange={(e) => setOrgEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>

            <input
              type="tel"
              value={orgPhone}
              onChange={(e) => setOrgPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full rounded-lg border px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            Create Organization
          </button>
        </form>
      </div>
    </div>
  );
}