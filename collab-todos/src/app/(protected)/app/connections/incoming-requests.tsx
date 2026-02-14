"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Request = {
  id: string;
  requester: string;
  status: string;
  profiles: { username: string } | null;
};

export function IncomingRequests({ requests }: { requests: Request[] }) {
  const router = useRouter();
  const [acting, setActing] = useState<string | null>(null);

  async function respond(id: string, status: "accepted" | "rejected") {
    setActing(id);
    const supabase = createClient();
    await supabase.from("connections").update({ status }).eq("id", id);
    router.refresh();
    setActing(null);
  }

  if (requests.length === 0) {
    return (
      <div className="p-6 bg-surface rounded-xl border border-border text-center">
        <p className="text-sm text-text-muted">No pending requests</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {requests.map((req) => (
        <li
          key={req.id}
          className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border"
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-coral/15 text-coral flex items-center justify-center text-xs font-semibold">
              {(req.profiles?.username ?? "U").charAt(0).toUpperCase()}
            </span>
            <span className="font-medium text-sm text-text-primary">
              {req.profiles?.username ?? "Unknown"}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => respond(req.id, "accepted")}
              disabled={acting === req.id}
              className="px-4 py-1.5 text-xs font-medium bg-teal text-white rounded-lg hover:bg-teal/90 disabled:opacity-40 transition-all"
            >
              Accept
            </button>
            <button
              onClick={() => respond(req.id, "rejected")}
              disabled={acting === req.id}
              className="px-4 py-1.5 text-xs font-medium border border-border text-text-secondary rounded-lg hover:border-coral hover:text-coral disabled:opacity-40 transition-all"
            >
              Decline
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
