"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          New Password
        </label>
        <input
          type="password"
          placeholder="Min 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-cream/30 text-sm placeholder:text-text-muted"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          Confirm New Password
        </label>
        <input
          type="password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-cream/30 text-sm placeholder:text-text-muted"
        />
      </div>
      {error && (
        <p className="text-coral text-sm bg-coral/10 px-3 py-2 rounded-lg">{error}</p>
      )}
      {success && (
        <p className="text-teal text-sm bg-teal/10 px-3 py-2 rounded-lg">{success}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-teal text-white text-sm font-medium rounded-xl hover:bg-teal/90 disabled:opacity-50 transition-all"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
