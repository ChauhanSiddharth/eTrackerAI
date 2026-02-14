import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChangePasswordForm } from "./change-password-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, created_at")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-8 max-w-lg">
      <div className="flex items-center gap-4">
        <Link
          href="/app"
          className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-text-muted hover:text-teal hover:border-teal/30 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-teal text-white rounded-full flex items-center justify-center text-xl font-bold">
            {(profile?.username ?? "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {profile?.username}
            </h2>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Username</span>
            <span className="font-medium text-text-primary">{profile?.username}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Email</span>
            <span className="font-medium text-text-primary">{user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Member since</span>
            <span className="font-medium text-text-primary">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6 space-y-5">
        <h2 className="text-base font-semibold text-text-primary">Change Password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
