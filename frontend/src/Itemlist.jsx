// ItemsList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import Table from "./Table";
import { getToken } from "./utils";

export default function ItemsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("id"); // "id", "name", or "status"
  const [sortOrder, setSortOrder] = useState("asc");
  const limit = 10;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `http://localhost:5000/items?limit=${limit}&offset=${offset}&search=${encodeURIComponent(
          searchTerm
        )}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [offset, searchTerm, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setOffset(0); // reset pagination on sort change
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Items</h2>

      {/* Search + Sort */}
      <div className="flex gap-2 mb-4 items-center">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setOffset(0);
            }}
            className="pl-10 p-2 border border-gray-300 rounded w-72 bg-gray-200 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition"
          />
        </div>

        {["id", "name", "status"].map((field) => (
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

      {loading ? (
        <div>Loading items…</div>
      ) : (
        <>
          <Table
            columns={[
              "ID", "User ID", "Name", "URL Storage", "Description", "Status",
              "Event ID", "Status Message", "Created At", "Updated At",
              "URL Thumbnail", "Open"
            ]}
            rows={items.map((i) => [
              i.id ?? "-",
              i.user_id ?? "-",
              i.name ?? "-",
              i.url_storage ?? "-",
              i.description ?? "-",
              i.status ?? "-",
              i.event_id ?? "-",
              i.status_message ?? "-",
              i.createdat ?? "-",
              i.updatedat ?? "-",
              i.url_thumbnail ? (
                <a
                  href={i.url_thumbnail}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700"
                >
                  View
                </a>
              ) : "-",
              <Link className="text-cyan-400 hover:underline" to={`/items/${i.id}`}>
                Open
              </Link>,
            ])}
          />

          {/* Pagination */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1 disabled:bg-cyan-200"
            >
              <ArrowLeft size={16} /> Prev
            </button>

            <button
              onClick={() => setOffset(offset + limit)}
              disabled={items.length < limit}
              className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1 disabled:bg-cyan-200"
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
