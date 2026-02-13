import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CreateListForm } from "./create-list-form";

type ListRow = {
  id: string;
  title: string;
  owner: string;
  created_at: string;
  list_members: { user_id: string; role: string }[];
};

export default async function AppPage() {
  const supabase = await createClient();

  const { data: listsRaw } = await supabase
    .from("todo_lists")
    .select("id, title, owner, created_at, list_members(user_id, role)")
    .order("created_at", { ascending: false });

  const lists = (listsRaw ?? []) as unknown as ListRow[];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Lists</h1>
      </div>

      <CreateListForm />

      <div className="space-y-3">
        {lists.length > 0 ? (
          lists.map((list) => {
            const isOwner = list.owner === user?.id;
            const memberCount = list.list_members?.length ?? 0;
            return (
              <Link
                key={list.id}
                href={`/app/lists/${list.id}`}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{list.title}</h2>
                    <p className="text-sm text-gray-500">
                      {isOwner ? "Owner" : "Shared with you"} &middot;{" "}
                      {memberCount} member{memberCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(list.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-gray-500 text-center py-8">
            No lists yet. Create one above!
          </p>
        )}
      </div>
    </div>
  );
}
