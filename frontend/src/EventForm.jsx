// EventForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getToken } from "./utils";

export function EventForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = mode === "edit";
  const [event, setEvent] = useState({});
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

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
          "Authorization": `Bearer ${getToken()}`,
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
