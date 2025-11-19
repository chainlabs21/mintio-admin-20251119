// ItemModerate.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "./utils";

export default function ItemModerate() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchItem = async () => {
      try {
        const res = await fetch(`http://localhost:5000/items/${id}`, {
          headers: {
            "Authorization": `Bearer ${getToken()}`,
          },
        });

        const data = await res.json();
        if (mounted) setItem(data);
      } catch (err) {
        console.error("Failed to fetch item:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchItem();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div>Loading item…</div>;
  if (!item) return <div>Item not found</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Moderate Item: {item.name}</h2>
      <div className="bg-gray-200 p-4 rounded border border-gray-300">
        <ul className="space-y-2">
          <li><strong>ID:</strong> {item.id}</li>
          <li><strong>User ID:</strong> {item.user_id}</li>
          <li><strong>Name:</strong> {item.name}</li>
          <li><strong>URL Storage:</strong> {item.url_storage}</li>
          <li><strong>Description:</strong> {item.description}</li>
          <li><strong>Status:</strong> {item.status}</li>
          <li><strong>Event ID:</strong> {item.event_id}</li>
          <li><strong>Status Message:</strong> {item.status_message}</li>
          <li><strong>Created At:</strong> {item.createdat}</li>
          <li><strong>Updated At:</strong> {item.updatedat}</li>
          <li>
            <strong>URL Thumbnail:</strong>{" "}
            {item.url_thumbnail ? (
              <a
                href={item.url_thumbnail}
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </a>
            ) : "-"}
          </li>
        </ul>
      </div>
    </div>
  );
}
