// ApiKeysPage.jsx
import React, { useState, useEffect } from "react";
import Table from "./Table";
import { getToken } from "./utils";
import { Search, ArrowUp, ArrowDown,ArrowLeft , ArrowRight } from "lucide-react";
import { BASE_URL, limit } from "./config.js";
import { formatDate } from "./formatdate.js";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  // Backend pagination state
  const [total, setTotal] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search & sort state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("DESC");

  // -----------------------------
  // Debounce search
  // -----------------------------
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // -----------------------------
  // Fetch API keys
  // -----------------------------
  useEffect(() => {
    let mounted = true;

    const fetchKeys = async () => {
      setLoading(true);
      const offset = (currentPage - 1) * limit;
      const searchParam = debouncedSearch.trim() === "" ? "_" : encodeURIComponent(debouncedSearch);

      try {
        const res = await fetch(
          `${BASE_URL}/admin/list/custom/sns_key/${searchParam}/${sortBy}/${sortOrder}/${offset}/${limit}`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          }
        );

        const data = await res.json();

        if (mounted) {
          setKeys(Array.isArray(data?.list) ? data.list : []);
          setTotal(data?.total ?? 0);

          // Compute backend-style pagination info
          const newStart = data?.total === 0 ? 0 : offset + 1;
          const newEnd = Math.min(offset + limit, data?.total ?? 0);
          const newTotalPages = Math.max(1, Math.ceil((data?.total ?? 0) / limit));

          setStart(newStart);
          setEnd(newEnd);
          setTotalPages(newTotalPages);
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
  }, [currentPage, debouncedSearch, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
    setCurrentPage(1); // Reset page when sorting changes
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">API Keys</h2>

      {/* Search + Sort */}
      <div className="flex gap-2 mb-4 items-center">
        <div className="relative w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search API keys…"
            className="w-full pr-10 pl-3 py-2 border border-cyan-300 rounded bg-gray-200 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <Search size={29} className="border border-cyan-400 rounded-full p-1" />
          </div>
        </div>

        {["id", "sns_id", "status", "createdat"].map((field) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className="px-3 py-1 bg-cyan-300 hover:bg-cyan-200 rounded transition flex items-center gap-1"
          >
            Sort by {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortBy === field ? (sortOrder === "ASC" ? <ArrowUp size={16} /> : <ArrowDown size={16} />) : null}
          </button>
        ))}
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
              formatDate(k.createdat),
              formatDate(k.updatedat),
            ])}
          />

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">

            {/* Left: Showing range */}
            <div className="font-small text-gray-600">
              Showing <b>{start}</b> - <b>{end}</b> of <b>{total}</b>
            </div>

            {/* Center: Buttons (Now same styling as second pagination) */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition 
                 flex items-center gap-1 disabled:bg-cyan-200 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} /> Previous
              </button>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition 
                 flex items-center gap-1 disabled:bg-cyan-200 disabled:cursor-not-allowed"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>

            {/* Right: Page info */}
            <div className="font-small text-gray-600">
              Page <b>{currentPage}</b> of <b>{totalPages}</b>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
