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
        <h2 className="text-2xl font-bold text-black mb-2">Event Detail</h2>

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

      {/* Event Details Table */}
      <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow">
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="px-4 py-2 font-bold">Event Title:</td>
            <td className="px-4 py-2">{e.name}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-bold">Kind:</td>
            <td className="px-4 py-2">{e.kind}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-bold">Status:</td>
            <td className="px-4 py-2">{e.status}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-bold">Event Date:</td>
            <td className="px-4 py-2">{e.event_date}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-bold">Join Start:</td>
            <td className="px-4 py-2">{e.join_start}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-bold">Join End:</td>
            <td className="px-4 py-2">{e.join_end}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-bold">Pre Exposure Start:</td>
            <td className="px-4 py-2">{e.exposure_pre_start}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-bold">Pre Exposure End:</td>
            <td className="px-4 py-2">{e.exposure_pre_end}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-bold">Main Exposure Start:</td>
            <td className="px-4 py-2">{e.exposure_main_start}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-bold">Main Exposure End:</td>
            <td className="px-4 py-2">{e.exposure_main_end}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-bold">Created:</td>
            <td className="px-4 py-2">{e.created}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-bold">Updated:</td>
            <td className="px-4 py-2">{e.updated}</td>
          </tr>
          <tr>
            <td className="px-4 py-2 font-bold">Description:</td>
            <td className="px-4 py-2">{e.description}</td>
          </tr>
        </tbody>
      </table>

    </div>
  );
}
