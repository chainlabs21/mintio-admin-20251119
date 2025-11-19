// Table.jsx
import React from "react";

export default function Table({ columns, rows }) {
  return (
    <div className="overflow-x-auto w-full border border-gray-300 rounded bg-white">
      <table className="w-full border-collapse">
        <thead className="bg-cyan-400/25 sticky top-0 z-10">
          <tr>
            {columns.map((c, i) => (
              <th key={i} className="text-left p-4 border-b border-gray-300 whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-gray-100 transition">
              {r.map((c, j) => (
                <td key={j} className="p-4 border-b border-gray-300 whitespace-nowrap max-w-xs truncate">
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
