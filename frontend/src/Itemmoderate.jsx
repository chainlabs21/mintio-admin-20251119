// ItemModerate.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getToken } from "./utils";

// Premium Toast identical to UsersList
function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/12 top-10 z-50">
      <div className="bg-black text-white px-5 py-3 rounded-lg shadow-2xl animate-slide-up flex items-center gap-3 min-w-[200px] justify-between">
        <span className="font-semibold text-lg">{message}</span>
        <button onClick={onClose} className="text-white font-bold">×</button>
      </div>
    </div>
  );
}

export default function ItemModerate() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toast state (identical behavior)
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const loadItem = async () => {
    try {
      const res = await fetch(`http://localhost:5000/items/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setItem(data);
    } catch (err) {
      console.error("Failed to fetch item:", err);
      showToast("Failed to fetch item.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [id]);

  // Update Item Status identical logic
  const updateStatus = async (newStatus) => {
    let actionText = "";

    switch (newStatus) {
      case 2: actionText = "Item banned."; break;
      case 1:
        actionText = item.status === 2 ? "Item unbanned." : "Item activated.";
        break;
      case 0: actionText = "Item deactivated."; break;
      default: actionText = "Item updated.";
    }

    try {
      const res = await fetch(`http://localhost:5000/items/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Status update failed");

      showToast(actionText);
      loadItem();
    } catch (err) {
      console.error("Item status update failed:", err);
      showToast("Failed to update item status.");
    }
  };

  if (loading) return <div>Loading item…</div>;
  if (!item) return <div>Item not found</div>;

  return (
    <div>
      <Toast message={toast} onClose={() => setToast("")} />

      {/* Title + Back */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Moderate Item</h2>

        <button
          onClick={() => navigate("/items")}
          className="flex items-center gap-2 px-3 py-2 border border-black text-black rounded transition cursor-pointer hover:bg-black/20"
        >
          <ArrowLeft size={18} /> Back to Items
        </button>
      </div>

      {/* Item Details */}
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
              <a href={item.url_thumbnail} target="_blank" rel="noreferrer">View</a>
            ) : (
              "-"
            )}
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
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
