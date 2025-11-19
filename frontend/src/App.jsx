// App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// -----------------------------
// API Helpers
// -----------------------------
import { getToken, clearToken } from "./utils"; // utils.js should contain getToken, clearToken


import EventDetail from "./EventDetail";


import ItemModerate from "./ItemModerate";

import Layout from "./layout";
import EventsList from "./EventList";
import ItemsList from "./Itemlist";
import UsersList from "./Userlist";
import UserDetail from "./UserDetail";
import ApiKeysPage from "./Apikeypages";
import { Dashboard } from "./Dashboard";
import LoginPage from "./LoginPage";
import { EventForm } from "./EventForm";

// -----------------------------
// MAIN APP ROUTES
// -----------------------------
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage/>} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </Router>
  );
}

// -----------------------------
// PROTECTED LAYOUT
// -----------------------------
function ProtectedLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    // Optional: verify token with backend
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
        <Route path="dashboard" element={<Dashboard/>} />

        {/* Events */}
        <Route path="events" element={<EventsList/>} />
        <Route path="events/create" element={<EventForm mode="create" />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="events/:id/edit" element={<EventForm mode="edit" />} />

        {/* Items */}
        <Route path="items" element={<ItemsList/>} />
        <Route path="items/:id" element={<ItemModerate />} />

        {/* Users */}
        <Route path="users" element={<UsersList/>} />
        <Route path="users/:id" element={<UserDetail/>} />

        {/* API Keys */}
        <Route path="apikeys" element={<ApiKeysPage/>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}
