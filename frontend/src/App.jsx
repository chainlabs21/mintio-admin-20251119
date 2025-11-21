// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


import Layout from "./layout";
import LoginPage from "./LoginPage";
import { Dashboard } from "./Dashboard";
import EventsList from "./EventList";
import EventDetail from "./Eventdetail";
import { EventForm } from "./EventForm";
import ItemsList from "./Itemlist";
import ItemModerate from "./Itemmoderate";
import UsersList from "./Userlist";
import UserDetail from "./Userdetail";
import ApiKeysPage from "./Apikeypages";
import ProtectedLayout from "./Protectedlayout";
import ProtectedLogin from "./Protectlogin";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login page (protected if user is already logged in) */}
        <Route
          path="/"
          element={
            <ProtectedLogin>
              <LoginPage />
            </ProtectedLogin>
          }
        />

        {/* All protected pages */}
        <Route path="/" element={<ProtectedLayout/>}>
          <Route path="dashboard" element={<Dashboard />} />

          {/* Events */}
          <Route path="events" element={<EventsList />} />
          <Route path="events/create" element={<EventForm mode="create" />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="events/:id/edit" element={<EventForm mode="edit" />} />

          {/* Items */}
          <Route path="items" element={<ItemsList />} />
          <Route path="items/:id" element={<ItemModerate />} />

          {/* Users */}
          <Route path="users" element={<UsersList />} />
          <Route path="users/:id" element={<UserDetail />} />

          {/* API Keys */}
          <Route path="apikeys" element={<ApiKeysPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
