// UsersList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Table from "./Table";
import { getToken } from "./utils";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/users?limit=${limit}&offset=${offset}`,
          {
            headers: {
              "Authorization": `Bearer ${getToken()}`,
            },
          }
        );

        const data = await res.json();
        if (mounted) setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetching users failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [offset]);

  if (loading) return <div>Loading users…</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Users</h2>

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
              <Link
                className="text-cyan-600 hover:underline"
                to={`/users/${u.id}`}
              >
                Open
              </Link>,
            ])}
          />

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
