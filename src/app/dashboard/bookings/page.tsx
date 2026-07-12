"use client";

import { useState } from "react";

const initialBookings = [
  {
    id: 1,
    asset: "Dell Laptop",
    user: "Harshita",
    startDate: "12 July 2026",
    endDate: "15 July 2026",
    status: "Approved",
  },
  {
    id: 2,
    asset: "MacBook Pro",
    user: "Anushka",
    startDate: "18 July 2026",
    endDate: "20 July 2026",
    status: "Pending",
  },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState(initialBookings);

  const [form, setForm] = useState({
    asset: "",
    user: "",
    startDate: "",
    endDate: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.asset || !form.user) return;

    setBookings([
      ...bookings,
      {
        id: bookings.length + 1,
        asset: form.asset,
        user: form.user,
        startDate: form.startDate,
        endDate: form.endDate,
        status: "Pending",
      },
    ]);

    setForm({
      asset: "",
      user: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Asset Bookings
        </h1>
        <p className="text-gray-500">
          Manage asset booking requests and schedules
        </p>
      </div>


      {/* Create Booking */}
      <div className="bg-white rounded-xl shadow p-5">

        <h2 className="font-semibold mb-4">
          Create Booking
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


          <input
            className="border rounded-lg p-3"
            placeholder="User Name"
            value={form.user}
            onChange={(e) =>
              setForm({
                ...form,
                user: e.target.value,
              })
            }
          />


          <div>
            <label className="text-sm text-gray-500">
              Start Date
            </label>

            <input
              type="date"
              className="border rounded-lg p-3 w-full"
              value={form.startDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  startDate: e.target.value,
                })
              }
            />
          </div>


          <div>
            <label className="text-sm text-gray-500">
              End Date
            </label>

            <input
              type="date"
              className="border rounded-lg p-3 w-full"
              value={form.endDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  endDate: e.target.value,
                })
              }
            />
          </div>


          <button
            className="bg-black text-white rounded-lg px-5 py-3 md:col-span-2"
          >
            Create Booking
          </button>

        </form>

      </div>



      {/* Booking History */}
      <div className="bg-white rounded-xl shadow">

        <div className="p-5 border-b">
          <h2 className="font-semibold">
            Booking History
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
                  User
                </th>

                <th className="p-4">
                  Start Date
                </th>

                <th className="p-4">
                  End Date
                </th>

                <th className="p-4">
                  Status
                </th>

              </tr>
            </thead>


            <tbody>

              {bookings.map((booking) => (

                <tr
                  key={booking.id}
                  className="border-b"
                >

                  <td className="p-4">
                    {booking.asset}
                  </td>

                  <td className="p-4">
                    {booking.user}
                  </td>

                  <td className="p-4">
                    {booking.startDate}
                  </td>

                  <td className="p-4">
                    {booking.endDate}
                  </td>

                  <td className="p-4">

                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        booking.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.status}
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