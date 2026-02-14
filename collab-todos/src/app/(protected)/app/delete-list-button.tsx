"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function DeleteListButton({
  listId,
  listTitle,
}: {
  listId: string;
  listTitle: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("todo_lists").delete().eq("id", listId);

    if (error) {
      alert("Failed to delete: " + error.message);
      setDeleting(false);
      setConfirming(false);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Delete &quot;{listTitle}&quot;?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn-danger btn-sm"
        >
          {deleting ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="btn-outline btn-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirming(true);
      }}
      className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-text-muted hover:text-coral hover:border-coral/30 transition-all"
      title="Delete list"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}
