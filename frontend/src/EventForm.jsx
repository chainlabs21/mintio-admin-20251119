// EventForm.jsx with premium toast replacing toastify
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getToken } from "./utils";
import { BASE_URL } from "./config";

// Premium Toast Component (same as UsersList)
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

export function EventForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = mode === "edit";

  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const [event, setEvent] = useState({
    title: "",
    description: "",
    kind: "",
    event_date: "",
    join_start: "",
    join_end: "",
    exposure_pre_start: "",
    exposure_pre_end: "",
    exposure_main_start: "",
    exposure_main_end: "",
    status: 1,
    status_message: "",
  });

  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  const formatDate = (val) => {
    if (!val) return "";
    if (val.includes("T")) return val.split("T")[0];
    return val;
  };

  useEffect(() => {
    if (!editing) return;
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch(`${BASE_URL}/events/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();

        if (mounted) {
          setEvent({
            ...data,
            event_date: formatDate(data.event_date),
            join_start: formatDate(data.join_start),
            join_end: formatDate(data.join_end),
            exposure_pre_start: formatDate(data.exposure_pre_start),
            exposure_pre_end: formatDate(data.exposure_pre_end),
            exposure_main_start: formatDate(data.exposure_main_start),
            exposure_main_end: formatDate(data.exposure_main_end),
            status: data.status || 1,
            status_message: data.status_message || "",
          });
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to load event.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, [editing, id]);

  if (editing && loading) return <div>Loading event…</div>;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = { ...event, status: Number(event.status) || 1 };

    try {
      const url = editing
        ? `${BASE_URL}/events/${id}`
        : `${BASE_URL}/events`;

      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Save failed");
        throw new Error("Save failed");
      }

      showToast(editing ? "Event updated!" : "Event created!");
      setTimeout(() => navigate("/events"), 800);
    } catch (err) {
      console.error(err);
      showToast("Save failed. Check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Toast message={toast} onClose={() => setToast("")} />

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">
          {editing ? "Edit Event" : "Create Event"}
        </h2>

        {editing && (
          <Link
            to={`/events/${id}`}
            className="flex items-center gap-2 text-cyan-500 border px-2 py-2 rounded-lg"
          >
            <ArrowLeft size={18} /> Back
          </Link>
        )}
      </div>

      <form
        className="bg-white p-6 rounded-xl shadow space-y-6 border border-gray-300"
        onSubmit={submit}
      >
        {editing && <Input label="ID" name="id" value={id} readOnly />}

        {/* 2-COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            name="title"
            label="Title"
            value={event.title}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
          />

          <Input
            name="description"
            label="Description"
            value={event.description}
            onChange={(e) => setEvent({ ...event, description: e.target.value })}
          />

          <Input
            name="kind"
            label="Kind"
            value={event.kind}
            onChange={(e) => setEvent({ ...event, kind: e.target.value })}
          />

          <Input
            name="event_date"
            type="date"
            label="Event Date"
            value={event.event_date}
            onChange={(e) => setEvent({ ...event, event_date: e.target.value })}
          />

          <label className="block text-sm">
            Status
            <select
              name="status"
              value={event.status}
              onChange={(e) => setEvent({ ...event, status: Number(e.target.value) })}
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
            value={event.status_message}
            onChange={(e) => setEvent({ ...event, status_message: e.target.value })}
          />

          <Input
            name="join_start"
            type="date"
            label="Join Start"
            value={event.join_start}
            onChange={(e) => setEvent({ ...event, join_start: e.target.value })}
          />

          <Input
            name="join_end"
            type="date"
            label="Join End"
            value={event.join_end}
            onChange={(e) => setEvent({ ...event, join_end: e.target.value })}
          />

          <Input
            name="exposure_pre_start"
            type="date"
            label="Pre Exposure Start"
            value={event.exposure_pre_start}
            onChange={(e) => setEvent({ ...event, exposure_pre_start: e.target.value })}
          />

          <Input
            name="exposure_pre_end"
            type="date"
            label="Pre Exposure End"
            value={event.exposure_pre_end}
            onChange={(e) => setEvent({ ...event, exposure_pre_end: e.target.value })}
          />

          <Input
            name="exposure_main_start"
            type="date"
            label="Main Exposure Start"
            value={event.exposure_main_start}
            onChange={(e) => setEvent({ ...event, exposure_main_start: e.target.value })}
          />

          <Input
            name="exposure_main_end"
            type="date"
            label="Main Exposure End"
            value={event.exposure_main_end}
            onChange={(e) => setEvent({ ...event, exposure_main_end: e.target.value })}
          />
        </div>

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
            onClick={() => navigate(editing ? `/events/${id}` : "/events")}
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
