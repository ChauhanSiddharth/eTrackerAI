"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Member = {
  user_id: string;
  role: string;
  username: string;
};

type Connection = {
  id: string;
  userId: string;
  username: string;
};

export function ShareSection({
  listId,
  currentMembers,
}: {
  listId: string;
  currentMembers: Member[];
}) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [sharing, setSharing] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const memberIds = new Set(currentMembers.map((m) => m.user_id));

  useEffect(() => {
    async function loadConnections() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("connections")
        .select(
          "id, requester, addressee, profiles!connections_requester_fkey(id, username), addressee_profile:profiles!connections_addressee_fkey(id, username)"
        )
        .eq("status", "accepted")
        .or(`requester.eq.${user.id},addressee.eq.${user.id}`);

      if (!data) return;

      const mapped = data
        .map((c) => {
          const isRequester = c.requester === user.id;
          const other = isRequester
            ? (c.addressee_profile as unknown as { id: string; username: string })
            : (c.profiles as unknown as { id: string; username: string });
          return {
            id: c.id,
            userId: other?.id ?? "",
            username: other?.username ?? "Unknown",
          };
        })
        .filter((c) => !memberIds.has(c.userId));

      setConnections(mapped);
    }

    loadConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  async function handleShare() {
    if (!selectedUser) return;
    setSharing(true);

    const { error } = await supabase
      .from("list_members")
      .insert({ list_id: listId, user_id: selectedUser, role: "editor" });

    if (error) {
      alert(error.message);
    } else {
      setSelectedUser("");
      router.refresh();
    }
    setSharing(false);
  }

  if (connections.length === 0) {
    return (
      <div className="p-4 bg-surface rounded-xl border border-border">
        <p className="text-sm text-text-muted">
          No connections available to share with. Add connections first.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 bg-surface rounded-xl border border-border space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">Share with a connection</h3>
      <div className="flex gap-2">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="flex-1 px-3.5 py-2.5 border border-border rounded-xl bg-cream/30 text-sm text-text-primary"
        >
          <option value="">Select a connection...</option>
          {connections.map((c) => (
            <option key={c.userId} value={c.userId}>
              {c.username}
            </option>
          ))}
        </select>
        <button
          onClick={handleShare}
          disabled={!selectedUser || sharing}
          className="btn-secondary"
        >
          {sharing ? "Sharing..." : "Share"}
        </button>
      </div>
    </div>
  );
}
