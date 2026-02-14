import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TodoList } from "./todo-list";
import { ShareSection } from "./share-section";
import Link from "next/link";

type MemberRow = {
  user_id: string;
  role: string;
  username: string;
};

type TodoRow = {
  id: string;
  list_id: string;
  title: string;
  is_done: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  const { data: list } = await supabase
    .from("todo_lists")
    .select("id, title, owner")
    .eq("id", id)
    .single();

  if (!list) notFound();

  const { data: todosRaw } = await supabase
    .from("todos")
    .select("*")
    .eq("list_id", id)
    .order("created_at", { ascending: true });

  const { data: membersRaw } = await supabase
    .rpc("get_list_members", { p_list_id: id });

  const todos = (todosRaw ?? []) as unknown as TodoRow[];
  const members = (membersRaw ?? []) as unknown as MemberRow[];
  const isOwner = list.owner === user.id;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/app"
          className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-text-muted hover:text-teal hover:border-teal/30 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary">{list.title}</h1>
          {isOwner && (
            <span className="text-xs font-medium bg-teal/10 text-teal px-2.5 py-1 rounded-full">
              Owner
            </span>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="flex gap-2 flex-wrap">
        {members.map((m) => (
          <span
            key={m.user_id}
            className="inline-flex items-center gap-1.5 text-xs bg-surface border border-border text-text-secondary px-2.5 py-1.5 rounded-full"
          >
            <span className="w-5 h-5 rounded-full bg-steel/15 text-steel flex items-center justify-center text-[10px] font-semibold">
              {(m.username ?? "U").charAt(0).toUpperCase()}
            </span>
            {m.username ?? "Unknown"}
            <span className="text-text-muted">({m.role})</span>
          </span>
        ))}
      </div>

      {/* Share section */}
      {isOwner && <ShareSection listId={id} currentMembers={members} />}

      {/* Todos */}
      <TodoList listId={id} initialTodos={todos} />
    </div>
  );
}
