// Layout.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Box,
  User,
  Key,
  LogOutIcon
} from "lucide-react";

import gitInfo from "./gitInfo.json";


import { getToken, clearToken } from "./utils";
import { BASE_URL } from "./config";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-white/40 text-gray-900">
      <aside className="w-64 bg-white p-6 flex flex-col border-r border-gray-200 shadow-lg shadow-cyan-600/30">

        <h2 className="text-xl font-bold text-teal-500 mb-10 text-center flex items-center justify-center gap-2 whitespace-nowrap px-5">
          <img src="logo (2).png" className="w-12 h-12 object-contain" alt="logo" />
          Mintio Admin
        </h2>

        <nav className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <NavItem to="/dashboard" label="Dashboard" icon={<LayoutDashboard size={18} />} />
            <NavItem to="/events" label="Events" icon={<Calendar size={18} />} />
            <NavItem to="/items" label="Items" icon={<Box size={18} />} />
            <NavItem to="/users" label="Users" icon={<User size={18} />} />
            <NavItem to="/apikeys" label="API Keys" icon={<Key size={18} />} />
          </div>
          <LogoutItem />
        </nav>
      </aside>

      <main className="flex-1 p-6 ">
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
      <span className="p-2 border-2 border-cyan-500 rounded-full bg-white shadow-sm">
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
      await fetch(`${BASE_URL}/api/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      clearToken();
      setLoading(false);
      navigate("/", { replace: true });
    }
  }

  return (
    <div>
      <button
        onClick={doLogout}
        disabled={loading}
        className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-red-50 transition-colors duration-300 text-red-600 font-medium"
      >
        <span className="p-2 border-2 border-red-500 rounded-full bg-white shadow-sm">
          <LogOutIcon size={16} />
        </span>
        <span>{loading ? "Logging out…" : "Logout"}</span>
      </button>

      {/* Git commit info below logout button */}
      <div className="mt-2 text-xs text-gray-400">
        Commit: {gitInfo.hash} | Last Updated: {gitInfo.date}
      </div>
    </div>
  );
}
