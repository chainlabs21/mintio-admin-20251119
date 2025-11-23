// UserDetail.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Table from "./Table";
import { getToken } from "./utils";
import { useNavigate } from "react-router-dom";
import { formatDate } from "./formatdate";
import { BASE_URL } from "./config";

export default function UserDetail() {
  const navigate = useNavigate()
  const { id } = useParams();
  const [user, setUser] = useState(null);

  const [userItems, setUserItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);

  const [offset, setOffset] = useState(0);
  const limit = 10;

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      // Fetch user info
      try {
        const res = await fetch(`${BASE_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = await res.json();
        if (mounted) setUser(data);
      } catch (err) {
        console.error("Fetching user failed:", err);
      }

      // Fetch user's items (paginated)
      try {
        const itemsRes = await fetch(
          `${BASE_URL}/items?user_id=${id}&limit=${limit}&offset=${offset}`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          }
        );

        const itemsData = await itemsRes.json();

        if (mounted) {
          setUserItems(itemsData.items || []);
          setTotal(itemsData.total || 0);
          setStart(itemsData.start || 0);
          setEnd(itemsData.end || 0);
          setCurrentPage(itemsData.currentPage || 1);
          setTotalPages(itemsData.totalPages || 1);
        }
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
      {/* Title + Back Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-2">
          User Detail
        </h2>

        <button
          onClick={() => navigate("/users")}
          className="flex items-center gap-2 px-3 py-2 border border-black
                 text-black rounded cursor-pointer hover:bg-black/20 transition"
        >
          <ArrowLeft size={18} />
          Back to User List
        </button>
      </div>

      {/* User Details Table */}
      <div className=" rounded mb-6 border border-gray-300 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <tbody>
            <tr>
              <th className="px-4 py-2 border-b border-gray-300 font-medium">ID</th>
              <td className="px-4 py-2 border-b border-gray-300">{user.id ?? "-"}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border-b border-gray-300 font-medium">Username</th>
              <td className="px-4 py-2 border-b border-gray-300">{user.username ?? "-"}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border-b border-gray-300 font-medium">Email</th>
              <td className="px-4 py-2 border-b border-gray-300">{user.email ?? "-"}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border-b border-gray-300 font-medium">Phone</th>
              <td className="px-4 py-2 border-b border-gray-300">{user.phone ?? "-"}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border-b border-gray-300 font-medium">Status</th>
              <td className="px-4 py-2 border-b border-gray-300">{user.status ?? "-"}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border-b border-gray-300 font-medium">Level</th>
              <td className="px-4 py-2 border-b border-gray-300">{user.level ?? "-"}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border-b border-gray-300 font-medium">Created At</th>
              <td className="px-4 py-2 border-b border-gray-300">{formatDate(user.createdat)}</td>
            </tr>
            <tr>
              <th className="px-4 py-2 border-b border-gray-300 font-medium">Updated At</th>
              <td className="px-4 py-2 border-b border-gray-300">{formatDate(user.updatedat)}</td>
            </tr>
          </tbody>
        </table>
      </div>


      <h3 className="text-2xl mb-4 font-bold">Uploaded Items</h3>

      {userItems.length === 0 ? (
        <div>No items uploaded by this user.</div>
      ) : (
        <>
          {/* ITEMS TABLE */}
          <Table
            columns={[
              "ID",
              "Thumbnail",
              "Name",
              "URL",
              "Description",
              "Status",
              "Event ID",
              "Status Message",
              "Created At",
              "Updated At",
              "Detail",
            ]}

            rows={userItems.map((i) => [
              i.id ?? "-",
              i.url_thumbnail ? (
                <img
                  src={i.url_thumbnail}
                  alt={i.name}
                  className="h-12 w-12 object-cover"
                />
              ) : (
                "-"
              ),
              i.name ?? "-",
              <a href={i.url_storage} target="_blank" rel="noopener noreferrer">
                Link
              </a>,
              i.description ?? "-",
              i.status ?? "-",
              i.event_id ?? "-",
              i.status_message ?? "-",
              formatDate(i.createdat),
              formatDate(i.updatedat),
              // NEW DETAIL LINK
              <Link
                className="text-cyan-400 font-semibold underline flex"
                to={`/items/${i.id}`}
              >
                Open
              </Link>,

            ])}
          />

          {/* PAGINATION BAR */}
          <div className="flex justify-between items-center mt-4">

            {/* LEFT: Showing X–Y of Z */}
            <div className="font-medium text-gray-600">
              Showing <b>{start}</b> - <b>{end}</b> of <b>{total}</b>
            </div>

            {/* CENTER: Prev / Next */}
            <div className="flex gap-2">
              <button
                onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1 disabled:bg-cyan-200 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} /> Prev
              </button>

              <button
                onClick={() => setOffset((prev) => prev + limit)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1 disabled:bg-cyan-200 disabled:cursor-not-allowed"
              >
                Next <ArrowRight size={16} />
              </button>
            </div>

            {/* RIGHT: Page X of Y */}
            <div className="font-medium text-gray-600">
              Page <b>{currentPage}</b> of <b>{totalPages}</b>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
