// ItemsList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search, ArrowUp, ArrowDown } from "lucide-react";
import Table from "./Table";
import { getToken } from "./utils";
import { BASE_URL, limit } from "./config";
import { formatDate } from "./formatdate";


export default function ItemsList() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchItems = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${BASE_URL}/items?limit=${limit}&offset=${offset}&search=${encodeURIComponent(
          searchTerm
        )}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setItems([]);
      setTotal(0);
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
    setOffset(0);
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const rangeStart = total === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + limit, total);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Items</h2>

      {/* Search + Sort */}
      <div className="flex gap-2 mb-4 items-center">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search items…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setOffset(0);
            }}
            className="w-full pr-10 pl-3 py-2 border border-cyan-300 rounded bg-gray-200 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <Search size={29} className="border border-cyan-400 rounded-full p-1" />
          </div>
        </div>

        {["id", "name", "status"].map((field) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className="px-3 py-1 bg-cyan-300 hover:bg-cyan-200 rounded transition flex items-center gap-2"
          >
            Sort by {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortBy === field &&
              (sortOrder === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Loading items…</div>
      ) : (
        <>
          <Table
            columns={[
              "ID",
              "User ID",
              "Thumbnail",
              "Name",
              "URL Storage",
              "Description",
              "Status",
              "Event ID",
              "Status Message",
              "Created At",
              "Updated At",
              "Open",
            ]}
            rows={items.map((i) => [
              i.id ?? "-",
              i.user_id ?? "-",
              // THUMBNAIL PREVIEW
              i.url_thumbnail ? (
                <a
                  href={i.url_thumbnail}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center"
                >
                  <img
                    src={i.url_thumbnail}
                    alt="thumbnail"
                    className="h-12 w-12 object-cover rounded border border-gray-300 hover:opacity-80 transition"
                  />
                </a>
              ) : (
                "-"
              ),
              i.name ?? "-",
              i.url_storage ?? "-",
              i.description ?? "-",
              i.status ?? "-",
              i.event_id ?? "-",
              i.status_message ?? "-",

              // DATE FIELDS (NON-WRAPPING)
              <div className="whitespace-nowrap">
                <div className="whitespace-nowrap">{formatDate(i.createdat)}</div>
              </div>,

              <div className="whitespace-nowrap">
                <div className="whitespace-nowrap">{formatDate(i.updatedat)}</div>
              </div>,



              // OPEN LINK
              <Link
                className="text-cyan-400 font-semibold underline flex"
                to={`/items/${i.id}`}
              >
                Open
              </Link>,
            ])}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-gray-700 font-small">
              Showing <b>{rangeStart}</b>–<b>{rangeEnd}</b> of <b>{total}</b>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1 disabled:bg-cyan-200"
              >
                <ArrowLeft size={16} /> Prev
              </button>

              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1 disabled:bg-cyan-200"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>

            <div className="text-gray-700 font-small">
              Page <b>{currentPage}</b> of <b>{totalPages}</b>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
