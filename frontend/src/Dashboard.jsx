import React, { useEffect, useState } from "react";
import { Calendar, Box, User, Clock, Edit2 } from "lucide-react";
import { BASE_URL } from "./config";

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
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token"); // assuming you store JWT in localStorage
        if (!token) return;

        const headers = {
          "Authorization": `Bearer ${token}`,
        };

        const [eventsRes, itemsRes, usersRes] = await Promise.all([
          fetch(`${BASE_URL}/events?limit=1`, { headers }),
          fetch(`${BASE_URL}/items?limit=1`, { headers }),
          fetch(`${BASE_URL}/users?limit=1`, { headers }),
        ]);


        const eventsData = await eventsRes.json();
        const itemsData = await itemsRes.json();
        const usersData = await usersRes.json();

        setEventsCount(eventsData.total ?? 0);
        setItemsCount(itemsData.total ?? 0);
        setUsersCount(usersData.total ?? 0);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setEventsCount("N/A");
        setItemsCount("N/A");
        setUsersCount("N/A");
      }
    }

    fetchStats();
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
