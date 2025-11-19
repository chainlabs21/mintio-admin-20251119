// App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";


import {
  LayoutDashboard,
  Calendar,
  Box,
  User,
  Key,
  LogOutIcon,
  ArrowRightIcon, Plus, ArrowLeft, ArrowRight, Search, Pencil, Check, X, Star, Clock, Edit2
} from "lucide-react";


/* -----------------------------
   UTILS (Token Management Placeholder)
----------------------------- */
function getToken() {
  return localStorage.getItem("token");
}
function saveToken(token) {
  localStorage.setItem("token", token);
}
function clearToken() {
  localStorage.removeItem("token");
}


/* -----------------------------
   LAYOUT
   ----------------------------- */
function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-white/40 text-gray-900">
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-200 shadow-lg 
                  shadow-cyan-600/30">
        {/* Header */}
        <h2 className="text-2xl font-bold text-cyan-600 mb-10 text-center whitespace-nowrap">
          Mintio Admin
        </h2>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <NavItem
              to="/dashboard"
              label="Dashboard"
              icon={<LayoutDashboard size={18} />}
            />
            <NavItem
              to="/events"
              label="Events"
              icon={<Calendar size={18} />}
            />
            <NavItem
              to="/items"
              label="Items"
              icon={<Box size={18} />}
            />
            <NavItem
              to="/users"
              label="Users"
              icon={<User size={18} />}
            />
            <NavItem
              to="/apikeys"
              label="API Keys"
              icon={<Key size={18} />}
            />
          </div>

          {/* Logout */}
          <LogoutItem />
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
        {children}
      </main>
    </div>
  );
}

function NavItem({ to, label, icon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-3 rounded-xl transition-colors duration-300 hover:bg-cyan-50 font-medium text-gray-900"
    >
      <span className="p-2 border-2 border-cyan-500 rounded-full flex items-center justify-center bg-white shadow-sm">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}


function LogoutItem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function doLogout() {
    const token = getToken();
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    setLoading(true);
    try {
      // Optional: notify backend to invalidate token
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Logout API failed:", err);
      // still proceed to clear token
    } finally {
      clearToken();
      setLoading(false);
      navigate("/", { replace: true });
    }
  }

  return (
    <button
      onClick={doLogout}
      disabled={loading}
      className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-red-50 transition-colors duration-300 text-red-600 font-medium"
    >
      <span className="p-2 border-2 border-red-500 rounded-full flex items-center justify-center bg-white shadow-sm">
        <LogOutIcon size={16} />
      </span>
      <span>{loading ? "Logging out…" : "Logout"}</span>
    </button>
  );
}




function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const adminId = e.target.adminId.value.trim();
    const password = e.target.password.value.trim();

    if (!adminId || !password) {
      setError("Please enter admin ID and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call backend login API
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: adminId, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Save token and redirect
        saveToken(data.token);
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid admin ID or password.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="bg-white p-8 rounded-lg shadow w-96 space-y-4 border border-cyan-400"
        onSubmit={submit}
      >
        <h2 className="text-xl font-bold text-cyan-400">Admin Login</h2>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <input
          name="adminId"
          className="w-full bg-gray-200 p-2 rounded border border-gray-900/30"
          placeholder="Admin ID"
        />
        <input
          name="password"
          type="password"
          className="w-full bg-gray-200 p-2 rounded border border-gray-900/30"
          placeholder="Password"
        />

        <button
          disabled={loading}
          className="bg-cyan-400 hover:bg-cyan-500 text-white w-full py-2 rounded transition shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          {loading ? "Logging in…" : "Login"}
          <ArrowRightIcon className="w-5 h-5" />
        </button>

        <div className="text-xs text-gray-500 mt-2">
          Use your real admin credentials.
        </div>
      </form>
    </div>
  );
}

/* -----------------------------
   DASHBOARD
   ----------------------------- */
export function Dashboard() {
  const [eventsCount, setEventsCount] = useState(null);
  const [itemsCount, setItemsCount] = useState(null);
  const [usersCount, setUsersCount] = useState(null);

  // Mock data
  const mockActivity = [
    { user: "John", action: "created a new event", time: "2h ago", avatar: "/avatar 1 (1).png", type: "event" },
    { user: "Sarah", action: "uploaded an item", time: "5h ago", avatar: "/avatar 1 (2).png", type: "item" },
    { user: "Mike", action: "joined as a new user", time: "1d ago", avatar: "/avatar 1 (3).png", type: "user" },
    { user: "Alice", action: "edited an event", time: "2d ago", avatar: "/avatar 1 (4).png", type: "event" }
  ];

  const topItems = [
    { name: "NFT Artwork #12", likes: 120, views: 450, status: "Active" },
    { name: "Crypto Collectible #5", likes: 95, views: 320, status: "Active" },
    { name: "Event Poster #1", likes: 80, views: 210, status: "Inactive" },
    { name: "Limited Edition #3", likes: 75, views: 180, status: "Active" },
  ];

  const topUsers = [
    { name: "John", avatar: "/avatar 1 (1).png", events: 5, items: 12, status: "Active" },
    { name: "Sarah", avatar: "/avatar 1 (2).png", events: 3, items: 8, status: "Active" },
    { name: "Mike", avatar: "/avatar 1 (3).png", events: 4, items: 6, status: "Inactive" },
  ];

  const recentEdits = [
    { user: "John", avatar: "/avatar 1 (1).png", content: "Event #12", time: "2h ago", type: "event" },
    { user: "Sarah", avatar: "/avatar 1 (2).png", content: "Item #5", time: "5h ago", type: "item" },
    { user: "Alice", avatar: "/avatar 1 (3).png", content: "Event #8", time: "1d ago", type: "event" },
  ];

  useEffect(() => {
    // Example: mock API calls
    setEventsCount(24);
    setItemsCount(56);
    setUsersCount(12);
  }, []);

  return (
    <div className="space-y-8">

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Events" value={eventsCount ?? "…"} icon={<Calendar size={35} />} bg="from-cyan-400 to-cyan-500" />
        <StatCard title="Items" value={itemsCount ?? "…"} icon={<Box size={35} />} bg="from-blue-400 to-blue-500" />
        <StatCard title="Users" value={usersCount ?? "…"} icon={<User size={35} />} bg="from-teal-400 to-teal-500" />
      </div>

      {/* --- Recent Activity Feed & Top Items --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-300">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock size={20} /> Recent Activity
          </h3>
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {mockActivity.map((act, i) => (
              <li key={i} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition">
                <img src={act.avatar} alt={act.user} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <span className="font-medium">{act.user}</span> {act.action}
                  <div className="text-gray-500 text-xs flex items-center gap-1">
                    <Clock size={12} /> {act.time}
                  </div>
                </div>
                <span className={`ml-auto text-sm font-semibold ${act.type === "event" ? "text-cyan-500" : act.type === "item" ? "text-blue-500" : "text-teal-500"}`}>
                  {act.type.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top 5 Items Table */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-300">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Edit2 size={20} /> Top 5 Items
          </h3>
          <table className="w-full border-collapse text-left">
            <thead className="bg-gray-50">
              <tr>
                {["Item", "Likes", "Views", "Status"].map((col, i) => (
                  <th key={i} className="p-4 text-gray-600 text-sm font-medium border-b border-gray-200">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topItems.map((i, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="p-4">{i.name}</td>
                  <td className="p-4">{i.likes}</td>
                  <td className="p-4">{i.views}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${i.status === "Active" ? "bg-green-500" : "bg-red-500"}`}>
                      {i.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Top Users & Recent Edits --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Users Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-300 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
              <User size={22} className="text-teal-500" /> Top 5 Users
            </h3>
            <span className="text-gray-500 text-sm">Most active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  {["User", "Events", "Items", "Status"].map((col, idx) => (
                    <th key={idx} className="p-4 text-gray-600 text-sm font-medium border-b border-gray-200">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topUsers.map((u, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="p-4 flex items-center gap-2">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-teal-400" />
                      {u.name}
                    </td>
                    <td className="p-4 text-gray-700">{u.events}</td>
                    <td className="p-4 text-gray-700">{u.items}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${u.status === "Active" ? "bg-green-500" : "bg-red-500"}`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Edits Feed */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-800 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
              <Edit2 size={22} className="text-yellow-400" /> Recent Edits
            </h3>
            <span className="text-gray-500 text-sm">Last 7 days</span>
          </div>
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {recentEdits.map((e, i) => (
              <li key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition shadow-sm">
                <img src={e.avatar} alt={e.user} className="w-10 h-10 rounded-full object-cover ring-2 ring-yellow-400" />
                <div className="flex-1">
                  <span className="font-medium text-gray-700">{e.user}</span> edited <span className="font-semibold">{e.content}</span>
                  <div className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                    <Clock size={12} /> {e.time}
                  </div>
                </div>
                <span className={`ml-auto text-sm font-semibold px-2 py-1 rounded-full text-white ${e.type === "event" ? "bg-cyan-500" : "bg-blue-500"}`}>
                  {e.type.toUpperCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  function StatCard({ title, value, icon, bg }) {
    return (
      <div className={`bg-gradient-to-br ${bg} p-10 rounded-xl shadow-lg border border-gray-200 hover:scale-105 hover:shadow-2xl transition transform duration-300`}>
        <div className="flex items-center justify-between">
          <div className="text-white font-semibold text-xl">{title}</div>
          <div className="text-white">{icon}</div>
        </div>
        <div className="text-white text-3xl font-bold mt-4">{value}</div>
      </div>
    );
  }
}

/* -----------------------------
   TABLE (REUSED & RESPONSIVE)
   ----------------------------- */
function Table({ columns, rows }) {
  return (
    <div className="overflow-x-auto w-full border border-gray-300 rounded bg-white">
      <table className="w-full border-collapse">
        <thead className="bg-cyan-400/25 sticky top-0 z-10">
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                className="text-left p-4 border-b border-gray-300 whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-gray-100 transition">
              {r.map((c, j) => (
                <td
                  key={j}
                  className="p-4 border-b border-gray-300 whitespace-nowrap max-w-xs truncate"
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



/* -----------------------------
   EVENTS
   ----------------------------- */
function EventsList() {
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
              "Authorization": `Bearer ${token}`,   // <-- send token
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

  // Filter by search
  let filtered = events.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort by filter buttons
  if (sortBy === "id") {
    filtered.sort((a, b) => (sortOrder === "asc" ? a.id - b.id : b.id - a.id));
  } else if (sortBy === "date") {
    filtered.sort((a, b) => {
      const da = new Date(a.event_date);
      const db = new Date(b.event_date);
      return sortOrder === "asc" ? da - db : db - da;
    });
  }

  // Pagination
  const paginated = filtered.slice(0, limit);

  // Normalize fields
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

  // Handle sort button click
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
                  <td className="p-4 border-b border-gray-300 max-w-xs truncate">{e.id}</td>
                  <td className="p-4 border-b border-gray-300 max-w-xs truncate">{e.name}</td>
                  <td className="p-4 border-b border-gray-300 max-w-xs truncate">{e.kind}</td>
                  <td className="p-4 border-b border-gray-300">{e.event_date}</td>
                  <td className="p-4 border-b border-gray-300 max-w-xs truncate">{e.status}</td>
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
                      key={e.id}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                      to={`/events/${e.id}`}
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
          className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1
               disabled:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft size={16} /> Prev
        </button>

        <button
          onClick={() => setOffset(offset + limit)}
          disabled={events.length < limit}   // <-- change `events` to your own variable
          className="px-3 py-1 bg-cyan-400 rounded hover:bg-cyan-500 transition flex items-center gap-1
               disabled:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}


function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const token = getToken(); // <-- get token first

        const res = await fetch(`http://localhost:5000/events/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,   // <-- send token
          },
        });

        const data = await res.json();
        if (mounted) setEvent(data);

      } catch (err) {
        console.error("Failed to fetch event:", err);
        setEvent(null);

      } finally {
        if (mounted) setLoading(false);
      }

    };

    fetchEvent();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div>Loading event…</div>;
  if (!event) return <div>Event not found</div>;

  // Normalize
  const e = {
    id: event.id,
    name: event.title,
    description: event.description,
    kind: event.kind,
    status: event.status_message,
    event_date: event.event_date,
    join_start: event.join_start,
    join_end: event.join_end,
    exposure_pre_start: event.exposure_pre_start,
    exposure_pre_end: event.exposure_pre_end,
    exposure_main_start: event.exposure_main_start,
    exposure_main_end: event.exposure_main_end,
    created: event.createdat,
    updated: event.updatedat,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">{e.name}</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/events")}
            className="flex items-center gap-2 text-black font-medium border border-gray-800 px-4 py-2 rounded"
          >
            <ArrowLeft size={18} /> Back to Events
          </button>
          <Link
            to={`/events/${id}/edit`}
            className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-500 px-4 py-2 rounded text-black font-semibold transition shadow-sm hover:shadow-md"
          >
            <Pencil size={16} /> Edit
          </Link>
        </div>
      </div>

      {/* Event Details */}
      <div className="bg-white p-5 rounded-xl shadow border border-gray-200 space-y-3">
        <div><b>Kind:</b> {e.kind}</div>
        <div><b>Status:</b> {e.status}</div>
        <div><b>Event Date:</b> {e.event_date}</div>
        <div><b>Join Start:</b> {e.join_start}</div>
        <div><b>Join End:</b> {e.join_end}</div>
        <div><b>Pre Exposure Start:</b> {e.exposure_pre_start}</div>
        <div><b>Pre Exposure End:</b> {e.exposure_pre_end}</div>
        <div><b>Main Exposure Start:</b> {e.exposure_main_start}</div>
        <div><b>Main Exposure End:</b> {e.exposure_main_end}</div>
        <div><b>Created:</b> {e.created}</div>
        <div><b>Updated:</b> {e.updated}</div>
        <div><b>Description:</b> {e.description}</div>
      </div>
    </div>
  );
}


export function EventForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = mode === "edit";
  const [event, setEvent] = useState({});
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  // Fetch event if editing
  useEffect(() => {
    if (!editing) return;

    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:5000/events/${id}`);
        const data = await res.json();
        if (mounted) setEvent(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [editing, id]);

  if (editing && loading) return <div>Loading event…</div>;
  const defaults = event ?? {};

  // Convert ANY date or datetime input → YYYY-MM-DD
  const toMySQLDate = (val) => {
    if (!val || val.trim() === "") return null;
    return val.split("T")[0];
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const form = Object.fromEntries(new FormData(e.target).entries());

    const payload = {
      title: form.title,
      description: form.description,
      kind: form.kind,
      event_date: toMySQLDate(form.event_date),
      status: Number(form.status) || 1,
      status_message: form.status_message || "",
      join_start: toMySQLDate(form.join_start),
      join_end: toMySQLDate(form.join_end),
      exposure_pre_start: toMySQLDate(form.exposure_pre_start),
      exposure_pre_end: toMySQLDate(form.exposure_pre_end),
      exposure_main_start: toMySQLDate(form.exposure_main_start),
      exposure_main_end: toMySQLDate(form.exposure_main_end),
    };

    try {
      const url = editing
        ? `http://localhost:5000/events/${id}`
        : `http://localhost:5000/events`;

      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`,   // ★ REQUIRED ★
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Server returned error:", data);
        throw new Error("Save failed");
      }

      alert(editing ? "Event updated!" : "Event created!");
      navigate("/events");
    } catch (err) {
      console.error(err);
      alert("Save failed. Check console.");
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">
          {editing ? "Edit Event" : "Create Event"}
        </h2>

        {editing && (
          <Link
            to={`/events/${defaults.id}`}
            className="flex items-center gap-2 text-cyan-500 border px-2 py-2 rounded-lg"
          >
            <ArrowLeft size={18} /> Back
          </Link>
        )}
      </div>

      <form
        className="bg-white p-6 rounded-xl shadow space-y-3 border border-gray-300"
        onSubmit={submit}
      >
        {editing && (
          <Input label="ID" name="id" defaultValue={defaults.id} readOnly />
        )}

        <Input name="title" label="Title" defaultValue={defaults.title} />

        <Input
          name="description"
          label="Description"
          defaultValue={defaults.description}
        />

        <Input name="kind" label="Kind" defaultValue={defaults.kind} />

        <Input
          name="event_date"
          type="date"
          label="Event Date"
          defaultValue={defaults.event_date ?? ""}
        />

        {/* Status */}
        <label className="block text-sm">
          Status
          <select
            name="status"
            defaultValue={Number(defaults.status) || 1}
            className="mt-1 block w-full rounded bg-gray-200 border border-gray-300 p-2"
          >
            <option value={1}>Active</option>
            <option value={2}>Completed</option>
            <option value={3}>Cancelled</option>
          </select>
        </label>

        <Input
          name="status_message"
          label="Status Message"
          defaultValue={defaults.status_message || ""}
        />

        {/* Date Fields */}
        <Input
          name="join_start"
          type="date"
          label="Join Start"
          defaultValue={defaults.join_start ?? ""}
        />

        <Input
          name="join_end"
          type="date"
          label="Join End"
          defaultValue={defaults.join_end ?? ""}
        />

        <Input
          name="exposure_pre_start"
          type="date"
          label="Pre Exposure Start"
          defaultValue={defaults.exposure_pre_start ?? ""}
        />

        <Input
          name="exposure_pre_end"
          type="date"
          label="Pre Exposure End"
          defaultValue={defaults.exposure_pre_end ?? ""}
        />

        <Input
          name="exposure_main_start"
          type="date"
          label="Main Exposure Start"
          defaultValue={defaults.exposure_main_start ?? ""}
        />

        <Input
          name="exposure_main_end"
          type="date"
          label="Main Exposure End"
          defaultValue={defaults.exposure_main_end ?? ""}
        />

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(editing ? `/events/${defaults.id}` : "/events")
            }
            className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="block text-sm">
      {label}
      <input
        className="mt-1 block w-full rounded bg-gray-200 border border-gray-300 p-2"
        {...props}
      />
    </label>
  );
}

/* -----------------------------
   ITEMS
   ----------------------------- */
function ItemsList() {
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


function ItemModerate() {
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

export function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/users?limit=${limit}&offset=${offset}`,
          {
            headers: {
              "Authorization": `Bearer ${getToken()}`,
            },
          }
        );

        const data = await res.json();
        if (mounted) setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetching users failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [offset]);

  if (loading) return <div>Loading users…</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Users</h2>

      {users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <>
          <Table
            columns={[
              "ID",
              "Username",
              "Email",
              "Phone",
              "Status",
              "Level",
              "Created At",
              "Updated At",
              "Open",
            ]}
            rows={users.map((u) => [
              u.id ?? "-",
              u.username ?? "-",
              u.email ?? "-",
              u.phone ?? "-",
              u.status ?? "-",
              u.level ?? "-",
              u.createdat ?? "-",
              u.updatedat ?? "-",
              <Link
                className="text-cyan-600 hover:underline"
                to={`/users/${u.id}`}
              >
                Open
              </Link>,
            ])}
          />

          {/* Pagination Controls */}
          <div className="flex gap-4 mt-4">
            <button
              className="px-3 py-1 bg-cyan-400 rounded disabled:opacity-40"
              onClick={() => setOffset((prev) => Math.max(prev - limit, 0))}
              disabled={offset === 0}
            >
              Prev
            </button>

            <button
              className="px-3 py-1 bg-cyan-400 rounded disabled:opacity-40"
              onClick={() => setOffset((prev) => prev + limit)}
              disabled={users.length < limit}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  // Items + pagination
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
        // Fetch paginated items uploaded by this user
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

          {/* Pagination */}
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


/* -----------------------------
   API KEYS
   ----------------------------- */
function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await Api.getApiKeys(0, 50);
        const list = res.data?.list ?? res.data ?? [];
        setKeys(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn("getApiKeys failed, using mock", err);
        setKeys(mockApiKeys);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">API Keys</h2>
      {loading ? <div>Loading API keys…</div> : <Table
        columns={["ID", "Provider", "Key"]}
        rows={keys.map(k => [k.id ?? "-", k.provider ?? "-", k.key ?? "-"])}
      />}
    </div>
  );
}

/* -----------------------------
   MAIN APP ROUTES
----------------------------- */
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </Router>
  );
}

/* -----------------------------
   PROTECTED LAYOUT
----------------------------- */
function ProtectedLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      // No token, redirect to login
      navigate("/", { replace: true });
      return;
    }

    // Optional: Verify token with backend
    fetch("http://localhost:5000/api/verify-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setAuthenticated(true);
        } else {
          clearToken();
          navigate("/", { replace: true });
        }
      })
      .catch((err) => {
        console.error("Token verification failed:", err);
        clearToken();
        navigate("/", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="p-6">Checking authentication…</div>;
  if (!authenticated) return null;

  return (
    <Layout>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="events" element={<EventsList />} />
        <Route path="events/create" element={<EventForm mode="create" />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="events/:id/edit" element={<EventForm mode="edit" />} />
        <Route path="items" element={<ItemsList />} />
        <Route path="items/:id" element={<ItemModerate />} />
        <Route path="users" element={<UsersList />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="apikeys" element={<ApiKeysPage />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}
