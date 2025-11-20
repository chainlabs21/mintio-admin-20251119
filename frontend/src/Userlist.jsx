// UsersList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Table from "./Table";
import { getToken } from "./utils";
import { Search } from "lucide-react";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id"); // id, username, status
  const [sortOrder, setSortOrder] = useState("asc");
  const limit = 6;

  // -----------------------------
  // Fetch Users
  // -----------------------------
  const loadUsers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:5000/users?limit=${limit}&offset=${offset}&search=${encodeURIComponent(
          search
        )}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetching users failed:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [offset, search, sortBy, sortOrder]);

  // -----------------------------
  // ACTION HANDLERS
  // -----------------------------
  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`http://localhost:5000/users/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      loadUsers();
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update user status.");
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setOffset(0);
  };

  if (loading) return <div>Loading users…</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Users</h2>

      {/* Search + Sort */}
      <div className="flex gap-2 mb-4 items-center">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
            className="pl-10 p-2 border border-gray-300 rounded w-72 bg-gray-200 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition"
          />
        </div>

        {["id", "username", "status"].map((field) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition"
          >
            Sort by {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
            {sortBy === field ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </button>
        ))}
      </div>

      {users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <>
          <Table
            columns={[
              "ID",
              "Username",
              "Email",
              "Phone",
              "Status",
              "Level",
              "Created At",
              "Updated At",
              "Actions",
              "Open",
            ]}
            rows={users.map((u) => [
              u.id ?? "-",
              u.username ?? "-",
              u.email ?? "-",
              u.phone ?? "-",
              u.status ?? "-",
              u.level ?? "-",
              u.createdat ?? "-",
              u.updatedat ?? "-",

              // -----------------------------
              // ACTION BUTTONS
              // -----------------------------
              <div className="flex flex-col gap-2">
                {u.status === 2 ? (
                  <button
                    onClick={() => updateStatus(u.id, 1)}
                    className="px-1 py-1 bg-green-500 text-white rounded-2xl cursor-pointer"
                  >
                    Unban
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus(u.id, 2)}
                    className="px-1 py-1 bg-red-500 text-white rounded-2xl cursor-pointer"
                  >
                    Ban
                  </button>
                )}

                {u.status === 0 ? (
                  <button
                    onClick={() => updateStatus(u.id, 1)}
                    className="px-1 py-1 bg-green-600 text-white rounded-2xl cursor-pointer"
                  >
                    Activate
                  </button>
                ) : (
                  u.status !== 2 && (
                    <button
                      onClick={() => updateStatus(u.id, 0)}
                      className="px-1 py-1 bg-gray-500 text-white rounded-2xl cursor-pointer"
                    >
                      Deactivate
                    </button>
                  )
                )}
              </div>,

              <Link className="text-cyan-600 hover:underline" to={`/users/${u.id}`}>
                Open
              </Link>,
            ])}
          />

          {/* Pagination */}
          <div className="flex gap-4 mt-4">
            <button
              className="px-3 py-1 bg-cyan-400 rounded disabled:opacity-40"
              onClick={() => setOffset((prev) => Math.max(prev - limit, 0))}
              disabled={offset === 0}
            >
              Prev
            </button>

            <button
              className="px-3 py-1 bg-cyan-400 rounded disabled:opacity-40"
              onClick={() => setOffset((prev) => prev + limit)}
              disabled={users.length < limit}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
