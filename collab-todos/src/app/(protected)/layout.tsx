import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AccountDropdown } from "./account-dropdown";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-surface border-b border-border px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/app"
              className="text-lg font-bold text-teal tracking-tight"
            >
              TrackerApp
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/app"
                className="text-sm text-text-secondary hover:text-teal px-3 py-1.5 rounded-lg hover:bg-cream transition-colors"
              >
                My Lists
              </Link>
              <Link
                href="/app/connections"
                className="text-sm text-text-secondary hover:text-teal px-3 py-1.5 rounded-lg hover:bg-cream transition-colors"
              >
                Connections
              </Link>
            </div>
          </div>
          <AccountDropdown username={profile?.username ?? user.email ?? "User"} />
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
