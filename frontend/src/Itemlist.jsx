// ItemsList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Table from "./Table"; // your existing Table component
import { getToken } from "./utils";

export default function ItemsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0); // pagination offset
  const limit = 10; // items per page

  useEffect(() => {
    let mounted = true;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/items?limit=${limit}&offset=${offset}`,
          {
            headers: {
              "Authorization": `Bearer ${getToken()}`,
            },
          }
        );

        const data = await res.json();
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch items:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchItems();
    return () => { mounted = false; };
  }, [offset]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Items</h2>

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
                <a href={i.url_thumbnail} target="_blank" rel="noopener noreferrer">
                  View
                </a>
              ) : "-",
              <Link className="text-cyan-600 hover:underline" to={`/items/${i.id}`}>
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
              className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1"
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
