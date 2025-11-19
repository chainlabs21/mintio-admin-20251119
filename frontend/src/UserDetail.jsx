// UserDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Table from "./Table";
import { getToken } from "./utils";

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  const [userItems, setUserItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [offset, setOffset] = useState(0);
  const limit = 10;

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      try {
        const res = await fetch(`http://localhost:5000/users/${id}`, {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        });

        const data = await res.json();
        if (mounted) setUser(data);
      } catch (err) {
        console.error("Fetching user failed:", err);
      }

      try {
        const itemsRes = await fetch(
          `http://localhost:5000/items?user_id=${id}&limit=${limit}&offset=${offset}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        const itemsData = await itemsRes.json();
        if (mounted) setUserItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (err) {
        console.error("Fetching user items failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, offset]);

  if (loading) return <div>Loading user…</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        User Detail: {user.username ?? user.id}
      </h2>

      <div className="bg-gray-200 p-4 rounded mb-4 border border-gray-300">
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>

      <h3 className="text-lg mb-2">Uploaded Items</h3>

      {userItems.length === 0 ? (
        <div>No items uploaded by this user.</div>
      ) : (
        <>
          <Table
            columns={[
              "ID",
              "Name",
              "URL",
              "Description",
              "Status",
              "Event ID",
              "Status Message",
              "Created At",
              "Updated At",
              "Thumbnail",
            ]}
            rows={userItems.map((i) => [
              i.id ?? "-",
              i.name ?? "-",
              <a href={i.url_storage} target="_blank" rel="noopener noreferrer">
                Link
              </a>,
              i.description ?? "-",
              i.status ?? "-",
              i.event_id ?? "-",
              i.status_message ?? "-",
              i.createdat ?? "-",
              i.updatedat ?? "-",
              i.url_thumbnail ? (
                <img
                  src={i.url_thumbnail}
                  alt={i.name}
                  className="h-12 w-12 object-cover"
                />
              ) : (
                "-"
              ),
            ])}
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
              disabled={offset === 0}
              className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1 disabled:bg-cyan-200 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} /> Prev
            </button>

            <button
              onClick={() => setOffset((prev) => prev + limit)}
              disabled={userItems.length < limit}
              className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1 disabled:bg-cyan-200 disabled:cursor-not-allowed"
            >
              Next <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
