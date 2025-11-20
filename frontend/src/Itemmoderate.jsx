import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getToken } from "./utils";

export default function ItemModerate() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadItem = async () => {
    try {
      const res = await fetch(`http://localhost:5000/items/${id}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();
      setItem(data);
    } catch (err) {
      console.error("Failed to fetch item:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [id]);

  // 🔥 Update item status (ban, unban, deactivate, activate)
  const updateStatus = async (newStatus) => {
    try {
      await fetch(`http://localhost:5000/items/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // reload item after update
      loadItem();

    } catch (err) {
      console.error("Item status update failed:", err);
      alert("Failed to update item status.");
    }
  };

  if (loading) return <div>Loading item…</div>;
  if (!item) return <div>Item not found</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Moderate Item: {item.name}</h2>

      <div className="bg-gray-200 p-4 rounded border border-gray-300 mb-4">
        <ul className="space-y-2">
          <li><strong>ID:</strong> {item.id}</li>
          <li><strong>User ID:</strong> {item.user_id}</li>
          <li><strong>Name:</strong> {item.name}</li>
          <li><strong>URL Storage:</strong> {item.url_storage}</li>
          <li><strong>Description:</strong> {item.description}</li>
          <li><strong>Status:</strong> {item.status}</li>
          <li><strong>Status Message:</strong> {item.status_message}</li>
          <li><strong>Event ID:</strong> {item.event_id}</li>
          <li><strong>Created At:</strong> {item.createdat}</li>
          <li><strong>Updated At:</strong> {item.updatedat}</li>
          <li>
            <strong>URL Thumbnail:</strong>{" "}
            {item.url_thumbnail ? (
              <a href={item.url_thumbnail} target="_blank">
                View
              </a>
            ) : (
              "-"
            )}
          </li>
        </ul>
      </div>

      {/* 🔥 ACTION BUTTONS */}
      <div className="flex gap-4">
        
        {/* BAN / UNBAN */}
        {item.status === 2 ? (
          <button
            onClick={() => updateStatus(1)}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Unban Item
          </button>
        ) : (
          <button
            onClick={() => updateStatus(2)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Ban Item
          </button>
        )}

        {/* DEACTIVATE / ACTIVATE */}
        {item.status === 0 ? (
          <button
            onClick={() => updateStatus(1)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Activate Item
          </button>
        ) : (
          item.status !== 2 && (
            <button
              onClick={() => updateStatus(0)}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Deactivate Item
            </button>
          )
        )}

      </div>
    </div>
  );
}
