// EventDetail.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { getToken } from "./utils";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const token = getToken(); 

        const res = await fetch(`http://localhost:5000/events/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
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
    return () => { mounted = false };
  }, [id]);

  if (loading) return <div>Loading event…</div>;
  if (!event) return <div>Event not found</div>;

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
            className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-500 px-4 py-2 rounded text-black font-semibold"
          >
            <Pencil size={16} /> Edit
          </Link>
        </div>
      </div>

      {/* Details */}
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
