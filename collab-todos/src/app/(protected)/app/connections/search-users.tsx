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
  const supabase = createClient();
  const router = useRouter();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);

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
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={searching}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {results.length > 0 && (
        <ul className="space-y-2">
          {results.map((profile) => (
            <li
              key={profile.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
            >
              <span className="font-medium">{profile.username}</span>
              <button
                onClick={() => sendInvite(profile.id)}
                disabled={sending === profile.id}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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
