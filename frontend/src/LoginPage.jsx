import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { saveToken } from "./utils";
import { BASE_URL } from "./config";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState(""); // controlled password

  async function submit(e) {
    e.preventDefault();
    const adminId = e.target.adminId.value.trim();

    if (!adminId || !password) {
      setError("Please enter admin ID and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminId, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        saveToken(data.token);
        navigate("/dashboard", { replace: true });
      } else {
        setError(data.message || "Invalid admin ID or password.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="bg-white p-8 rounded-lg shadow w-96 space-y-4 border border-cyan-400"
        onSubmit={submit}
      >
        <h2 className="text-xl font-bold text-cyan-400">Admin Login</h2>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <input
          name="adminId"
          className="w-full bg-gray-200 p-2 rounded border border-gray-900/30"
          placeholder="Username"
        />

        {/* Password Field with Custom Toggle */}
        <div className="w-full flex items-center bg-gray-200 p-2 rounded border border-gray-900/30">
          <input
            name="password"
            type="text" // always text to prevent browser eye icon
            className="w-full bg-transparent outline-none"
            placeholder="Password"
            autoComplete="off"
            spellCheck="false"
            value={showPassword ? password : password.replace(/./g, "•")} // mask manually
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-600 hover:text-gray-900 ml-2"
          >
            {showPassword ? (
              <EyeOffIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <button
          disabled={loading}
          className="bg-cyan-400 hover:bg-cyan-500 text-white w-full py-2 rounded transition shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          {loading ? "Logging in…" : "Login"}
          <ArrowRightIcon className="w-5 h-5" />
        </button>

        <div className="text-xs text-gray-500 mt-2">
          Use your real admin credentials.
        </div>
      </form>
    </div>
  );
}
