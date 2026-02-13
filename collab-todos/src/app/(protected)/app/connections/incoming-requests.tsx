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
  const supabase = createClient();
  const router = useRouter();
  const [acting, setActing] = useState<string | null>(null);

  async function respond(id: string, status: "accepted" | "rejected") {
    setActing(id);
    await supabase.from("connections").update({ status }).eq("id", id);
    router.refresh();
    setActing(null);
  }

  if (requests.length === 0) {
    return <p className="text-gray-400">No pending requests.</p>;
  }

  return (
    <ul className="space-y-2">
      {requests.map((req) => (
        <li
          key={req.id}
          className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
        >
          <span className="font-medium">
            {req.profiles?.username ?? "Unknown"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => respond(req.id, "accepted")}
              disabled={acting === req.id}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={() => respond(req.id, "rejected")}
              disabled={acting === req.id}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
