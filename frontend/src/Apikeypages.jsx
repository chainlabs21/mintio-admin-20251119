// ApiKeysPage.jsx
import React, { useState, useEffect } from "react";
import Table from "./Table";
import { getToken } from "./utils";
import { Search } from "lucide-react";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC");
  const limit = 10;

  // -----------------------------
  // Debounce search
  // -----------------------------
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // -----------------------------
  // Fetch keys
  // -----------------------------
  useEffect(() => {
    let mounted = true;

    const fetchKeys = async () => {
      setLoading(true);
      const offset = page * limit;
      try {
        const searchParam = debouncedSearch.trim() === "" ? "_" : encodeURIComponent(debouncedSearch);
        const res = await fetch(
          `http://localhost:5000/admin/list/custom/sns_key/${searchParam}/${sortBy}/${sortOrder}/${offset}/${limit}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();
        if (mounted) {
          setKeys(Array.isArray(data?.list) ? data.list : []);
          setTotal(data?.total ?? 0);
        }
      } catch (err) {
        console.error("Fetching API keys failed:", err);
        if (mounted) setKeys([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchKeys();
    return () => { mounted = false; };
  }, [page, debouncedSearch, sortBy, sortOrder]);

  const totalPages = Math.ceil(total / limit);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">API Keys</h2>

      {/* Search */}
      <div className="mb-4 flex gap-2 items-center">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search API keys…"
            className="pl-10 p-2 border border-gray-300 rounded w-72 bg-gray-200 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition"
          />
        </div>

        <button onClick={() => toggleSort("id")} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition">
          Sort by ID {sortBy === "id" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
        </button>

        <button onClick={() => toggleSort("sns_id")} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition">
          Sort by SNS ID {sortBy === "sns_id" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
        </button>

        <button onClick={() => toggleSort("status")} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition">
          Sort by Status {sortBy === "status" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
        </button>

        <button onClick={() => toggleSort("createdat")} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition">
          Sort by Created {sortBy === "createdat" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
        </button>
      </div>

      {loading ? (
        <div>Loading API keys…</div>
      ) : (
        <>
          <Table
            columns={[
              "ID",
              "SNS ID",
              "API Key",
              "API Secret",
              "Access Token",
              "Action",
              "Status",
              "Status Message",
              "Created At",
              "Updated At",
            ]}
            rows={keys.map((k) => [
              k.id ?? "-",
              k.sns_id ?? "-",
              k.api_key ?? "-",
              k.api_secret ?? "-",
              k.access_token ?? "-",
              k.action ?? "-",
              k.status ?? "-",
              k.status_message ?? "-",
              k.createdat ?? "-",
              k.updatedat ?? "-",
            ])}
          />

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 0))}
              disabled={page === 0}
              className="px-4 py-2 bg-cyan-400 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span>Page {page + 1} of {totalPages || 1}</span>

            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-cyan-400 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
