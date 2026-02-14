"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function CreateListForm() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("todo_lists")
      .insert({ title: title.trim(), owner: user.id });

    if (!error) {
      setTitle("");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="New list name..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 px-3.5 py-2.5 border border-border rounded-xl bg-surface text-sm placeholder:text-text-muted"
      />
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="px-5 py-2.5 bg-teal text-white text-sm font-medium rounded-xl hover:bg-teal/90 disabled:opacity-40 transition-all"
      >
        {loading ? "Creating..." : "Create List"}
      </button>
    </form>
  );
}
