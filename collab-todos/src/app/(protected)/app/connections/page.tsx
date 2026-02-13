import { createClient } from "@/lib/supabase/server";
import { SearchUsers } from "./search-users";
import { IncomingRequests } from "./incoming-requests";
import { AcceptedConnections } from "./accepted-connections";

type IncomingRequest = {
  id: string;
  requester: string;
  status: string;
  profiles: { username: string } | null;
};

type AcceptedConnection = {
  id: string;
  requester: string;
  addressee: string;
  profiles: { id: string; username: string } | null;
  addressee_profile: { id: string; username: string } | null;
};

export default async function ConnectionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Incoming pending requests
  const { data: incoming } = await supabase
    .from("connections")
    .select("id, requester, status, profiles!connections_requester_fkey(username)")
    .eq("addressee", user.id)
    .eq("status", "pending");

  // Accepted connections (either direction)
  const { data: accepted } = await supabase
    .from("connections")
    .select(
      "id, requester, addressee, profiles!connections_requester_fkey(id, username), addressee_profile:profiles!connections_addressee_fkey(id, username)"
    )
    .eq("status", "accepted")
    .or(`requester.eq.${user.id},addressee.eq.${user.id}`);

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Connections</h1>

      {/* Search & invite */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Find People</h2>
        <SearchUsers userId={user.id} />
      </section>

      {/* Incoming */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Incoming Requests ({incoming?.length ?? 0})
        </h2>
        <IncomingRequests requests={(incoming as unknown as IncomingRequest[]) ?? []} />
      </section>

      {/* Accepted */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Your Connections ({accepted?.length ?? 0})
        </h2>
        <AcceptedConnections connections={(accepted as unknown as AcceptedConnection[]) ?? []} userId={user.id} />
      </section>
    </div>
  );
}
