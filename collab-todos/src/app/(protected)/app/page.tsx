import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CreateListForm } from "./create-list-form";

type ListRow = {
  id: string;
  title: string;
  owner: string;
  created_at: string;
};

export default async function AppPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listsRaw } = await supabase
    .from("todo_lists")
    .select("id, title, owner, created_at")
    .order("created_at", { ascending: false });

  const lists = (listsRaw ?? []) as unknown as ListRow[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Lists</h1>
        <p className="text-sm text-text-muted mt-1">
          Create and manage your task lists
        </p>
      </div>

      <CreateListForm />

      <div className="space-y-3">
        {lists.length > 0 ? (
          lists.map((list) => {
            const isOwner = list.owner === user?.id;
            return (
              <Link
                key={list.id}
                href={`/app/lists/${list.id}`}
                className="group block p-5 bg-surface rounded-xl border border-border hover:border-teal/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal/10 flex items-center justify-center">
                      <svg className="w-4.5 h-4.5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-semibold text-text-primary group-hover:text-teal transition-colors">
                        {list.title}
                      </h2>
                      <p className="text-xs text-text-muted mt-0.5">
                        {isOwner ? "Owner" : "Shared with you"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-muted">
                      {new Date(list.created_at).toLocaleDateString()}
                    </span>
                    <svg className="w-4 h-4 text-text-muted group-hover:text-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center py-16 bg-surface rounded-xl border border-border">
            <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-text-secondary font-medium">No lists yet</p>
            <p className="text-sm text-text-muted mt-1">
              Create your first list above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
