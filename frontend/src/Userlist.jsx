// UsersList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Table from "./Table";
import { getToken } from "./utils";
import { Search, ArrowUp, ArrowDown, ArrowRight, ArrowLeft } from "lucide-react";
import { limit } from "./config";
import { formatDate } from "./formatdate";

// Simple premium toast component
function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/3 top-10 z-50">
      <div className="bg-black text-white px-5 py-3 rounded-xl shadow-2xl animate-slide-up flex items-center gap-3 min-w-[200px] justify-between">
        <span className="font-semibold text-lg">{message}</span>
        <button onClick={onClose} className="text-white font-bold">×</button>
      </div>
    </div>
  );
}

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  const [total, setTotal] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Toast state
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // --------------------------------------------------
  // Fetch users
  // --------------------------------------------------
  const loadUsers = async () => {
    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:5000/users?limit=${limit}&offset=${offset}&search=${encodeURIComponent(
          search
        )}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      setUsers(data.users || []);
      setTotal(data.total || 0);
      setStart(data.start || 0);
      setEnd(data.end || 0);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Fetching users failed:", err);
      setUsers([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [offset, search, sortBy, sortOrder]);

  // --------------------------------------------------
  // Update Status + Premium Toast
  // --------------------------------------------------
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/users/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed response");

      let msg = "";
      if (newStatus === 2) msg = "User banned successfully.";
      if (newStatus === 1) msg = "User activated / unbanned successfully.";
      if (newStatus === 0) msg = "User deactivated successfully.";

      showToast(msg);
      loadUsers();
    } catch (err) {
      console.error("Status update failed:", err);
      showToast("Failed to update user status.");
    }
  };

  // Sorting
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
      <Toast message={toast} onClose={() => setToast("")} />

      <h2 className="text-2xl font-bold mb-4">Users</h2>

      {/* Search + Sort */}
      <div className="flex gap-2 mb-4 items-center">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
            className="w-full pr-10 pl-3 py-2 border border-cyan-300 rounded bg-gray-200 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <Search size={29} className="border border-cyan-300 rounded-full p-1" />
          </div>
        </div>

        {["id", "username", "status"].map((field) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className="px-3 py-1 bg-cyan-300 hover:bg-cyan-200 rounded transition flex items-center gap-1"
          >
            Sort by {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortBy === field ? (
              sortOrder === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
            ) : null}
          </button>
        ))}
      </div>

      {users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <>
          <Table
            columns={["ID", "Username", "Email", "Phone", "Status", "Level", "Created At", "Updated At", "Actions", "Detail"]}
            rows={users.map((u) => [
              u.id ?? "-",
              u.username ?? "-",
              u.email ?? "-",
              u.phone ?? "-",
              u.status ?? "-",
              u.level ?? "-",
              formatDate(u.createdat),
              formatDate(u.updatedat),

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

              <Link className="text-cyan-400 font-semibold underline" to={`/users/${u.id}`}>
                Open
              </Link>,
            ])}
          />

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <div className="font-small text-gray-600">
              Showing <b>{start}</b> - <b>{end}</b> of <b>{total}</b>
            </div>

            <div className="flex gap-2">
              {/* Previous */}
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    setOffset((newPage - 1) * limit);
                  }
                }}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition disabled:bg-cyan-200 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ArrowLeft size={16} /> Previous
              </button>

              {/* Next */}
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    setOffset((newPage - 1) * limit);
                  }
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition disabled:bg-cyan-200 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>

            <div className="font-small text-gray-600">
              Page <b>{currentPage}</b> of <b>{totalPages}</b>
            </div>
          </div>

        </>
      )}
    </div>
  );
}
