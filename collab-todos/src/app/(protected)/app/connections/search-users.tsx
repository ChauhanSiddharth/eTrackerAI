"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Profile = { id: string; username: string };

export function SearchUsers({ userId }: { userId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const router = useRouter();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);

    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", `%${query.trim()}%`)
      .neq("id", userId)
      .limit(10);

    setResults(data ?? []);
    setSearching(false);
  }

  async function sendInvite(addresseeId: string) {
    setSending(addresseeId);
    const supabase = createClient();
    const { error } = await supabase
      .from("connections")
      .insert({ requester: userId, addressee: addresseeId });

    if (error) {
      alert(error.message);
    } else {
      router.refresh();
    }
    setSending(null);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3.5 py-2.5 border border-border rounded-xl bg-surface text-sm placeholder:text-text-muted"
        />
        <button
          type="submit"
          disabled={searching}
          className="btn-secondary"
        >
          Search
        </button>
      </form>

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((profile) => (
            <li
              key={profile.id}
              className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-steel/15 text-steel flex items-center justify-center text-xs font-semibold">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
                <span className="font-medium text-sm text-text-primary">{profile.username}</span>
              </div>
              <button
                onClick={() => sendInvite(profile.id)}
                disabled={sending === profile.id}
                className="btn-primary btn-sm"
              >
                {sending === profile.id ? "Sending..." : "Send Invite"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
