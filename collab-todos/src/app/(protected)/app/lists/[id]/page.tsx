import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TodoList } from "./todo-list";
import { ShareSection } from "./share-section";
import Link from "next/link";

type MemberRow = {
  user_id: string;
  role: string;
  profiles: { username: string } | null;
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
    .from("list_members")
    .select("user_id, role, profiles(username)")
    .eq("list_id", id);

  const todos = (todosRaw ?? []) as unknown as TodoRow[];
  const members = (membersRaw ?? []) as unknown as MemberRow[];
  const isOwner = list.owner === user.id;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/app" className="text-gray-400 hover:text-gray-600">
          &larr; Back
        </Link>
        <h1 className="text-2xl font-bold">{list.title}</h1>
        {isOwner && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            Owner
          </span>
        )}
      </div>

      {/* Members */}
      <div className="flex gap-2 flex-wrap">
        {members.map((m) => (
          <span
            key={m.user_id}
            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
          >
            {m.profiles?.username ?? "Unknown"} ({m.role})
          </span>
        ))}
      </div>

      {/* Share section – only visible to owner */}
      {isOwner && <ShareSection listId={id} currentMembers={members} />}

      {/* Todos */}
      <TodoList listId={id} initialTodos={todos} />
    </div>
  );
}
