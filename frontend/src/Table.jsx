// Table.jsx
import React from "react";

export default function Table({ columns, rows }) {
  return (
    <div className="w-full border border-gray-300 rounded bg-white overflow-x-hidden">
      <table className="w-full table-auto border-collapse text-sm">
        <thead className="bg-cyan-400/25 sticky top-0 z-10">
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                className={`p-4.5 border-b border-gray-300 ${
                  ["ID", "Kind", "Event Date", "Join Start", "Join End", "Pre Exposure Start", "Pre Exposure End", "Main Exposure Start", "Main Exposure End", "Created", "Updated"].includes(c)
                    ? "text-center"
                    : "text-left max-w-[150px] truncate"
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-gray-100 transition-colors">
              {r.map((c, j) => (
                <td
                  key={j}
                  className={`p-4.5 border-b border-gray-300 ${
                    typeof c === "number" || ["ID"].includes(columns[j])
                      ? "text-center font-medium"
                      : "max-w-xs truncate"
                  }`}
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
