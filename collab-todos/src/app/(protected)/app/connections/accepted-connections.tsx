"use client";

type Connection = {
  id: string;
  requester: string;
  addressee: string;
  profiles: { id: string; username: string } | null;
  addressee_profile: { id: string; username: string } | null;
};

export function AcceptedConnections({
  connections,
  userId,
}: {
  connections: Connection[];
  userId: string;
}) {
  if (connections.length === 0) {
    return (
      <div className="p-6 bg-surface rounded-xl border border-border text-center">
        <p className="text-sm text-text-muted">No connections yet</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {connections.map((conn) => {
        const otherProfile =
          conn.requester === userId
            ? conn.addressee_profile
            : conn.profiles;

        return (
          <li
            key={conn.id}
            className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-teal/15 text-teal flex items-center justify-center text-xs font-semibold">
                {(otherProfile?.username ?? "U").charAt(0).toUpperCase()}
              </span>
              <span className="font-medium text-sm text-text-primary">
                {otherProfile?.username ?? "Unknown"}
              </span>
            </div>
            <span className="text-xs font-medium text-teal bg-teal/10 px-2.5 py-1 rounded-full">
              Connected
            </span>
          </li>
        );
      })}
    </ul>
  );
}
