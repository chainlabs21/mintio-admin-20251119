// EventsList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ArrowLeft, ArrowRight } from "lucide-react";
import { getToken } from "./utils";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(null); // "id" or "date"
  const [sortOrder, setSortOrder] = useState("asc"); // asc / desc
  const limit = 6;

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const token = getToken(); // <-- get token

        const res = await fetch(
          `http://localhost:5000/events?limit=${limit}&offset=${offset}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`, // <-- send token
            },
          }
        );

        const data = await res.json();
        setEvents(data);

      } catch (err) {
        console.error("Failed to fetch events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [offset]);

  // Filter
  let filtered = events.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Sorting
  if (sortBy === "id") {
    filtered.sort((a, b) => (sortOrder === "asc" ? a.id - b.id : b.id - a.id));
  } else if (sortBy === "date") {
    filtered.sort((a, b) => {
      const da = new Date(a.event_date);
      const db = new Date(b.event_date);
      return sortOrder === "asc" ? da - db : db - da;
    });
  }

  const paginated = filtered.slice(0, limit);

  const enriched = paginated.map((e) => ({
    id: e.id,
    name: e.title ?? "Untitled",
    description: e.description ?? "",
    kind: e.kind ?? "-",
    event_date: e.event_date ?? "-",
    status: e.status_message ?? "unknown",
    join_start: e.join_start ?? "-",
    join_end: e.join_end ?? "-",
    exposure_pre_start: e.exposure_pre_start ?? "-",
    exposure_pre_end: e.exposure_pre_end ?? "-",
    exposure_main_start: e.exposure_main_start ?? "-",
    exposure_main_end: e.exposure_main_end ?? "-",
    created: e.createdat ?? "-",
    updated: e.updatedat ?? "-",
  }));

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">Events List</h2>
        <Link
          to="/events/create"
          className="bg-cyan-400 hover:bg-cyan-500 px-3 py-2 rounded text-black transition font-semibold flex items-center gap-2"
        >
          <Plus size={16} /> Create Event
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex gap-2 items-center">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="pl-10 p-2 border border-gray-300 rounded w-72 bg-gray-200 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition"
          />
        </div>

        <button
          onClick={() => toggleSort("id")}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition"
        >
          Sort by ID {sortBy === "id" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
        </button>

        <button
          onClick={() => toggleSort("date")}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded transition"
        >
          Sort by Date {sortBy === "date" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full border border-gray-300 rounded bg-white">
        {loading ? (
          <div className="p-4">Loading events…</div>
        ) : (
          <table className="min-w-full border-collapse">
            <thead className="bg-cyan-400/25">
              <tr>
                {[
                  "ID",
                  "Title",
                  "Kind",
                  "Event Date",
                  "Status",
                  "Join Start",
                  "Join End",
                  "Pre Exposure Start",
                  "Pre Exposure End",
                  "Main Exposure Start",
                  "Main Exposure End",
                  "Created",
                  "Updated",
                  "Open",
                ].map((c, i) => (
                  <th key={i} className="text-left p-4 border-b border-gray-300">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enriched.map((e, i) => (
                <tr key={i} className="hover:bg-gray-100 transition">
                  <td className="p-4 border-b border-gray-300">{e.id}</td>
                  <td className="p-4 border-b border-gray-300">{e.name}</td>
                  <td className="p-4 border-b border-gray-300">{e.kind}</td>
                  <td className="p-4 border-b border-gray-300">{e.event_date}</td>
                  <td className="p-4 border-b border-gray-300">{e.status}</td>
                  <td className="p-4 border-b border-gray-300">{e.join_start}</td>
                  <td className="p-4 border-b border-gray-300">{e.join_end}</td>
                  <td className="p-4 border-b border-gray-300">{e.exposure_pre_start}</td>
                  <td className="p-4 border-b border-gray-300">{e.exposure_pre_end}</td>
                  <td className="p-4 border-b border-gray-300">{e.exposure_main_start}</td>
                  <td className="p-4 border-b border-gray-300">{e.exposure_main_end}</td>
                  <td className="p-4 border-b border-gray-300">{e.created}</td>
                  <td className="p-4 border-b border-gray-300">{e.updated}</td>
                  <td className="p-4 border-b border-gray-300">
                    <Link
                      to={`/events/${e.id}`}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      Open <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setOffset(Math.max(0, offset - limit))}
          disabled={offset === 0}
          className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1 disabled:bg-cyan-200 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} /> Prev
        </button>

        <button
          onClick={() => setOffset(offset + limit)}
          disabled={events.length < limit}
          className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1 disabled:bg-cyan-200 disabled:cursor-not-allowed"
        >
          Next <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
