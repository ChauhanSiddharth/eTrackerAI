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
    return <p className="text-gray-400">No connections yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {connections.map((conn) => {
        // Show the other person's username
        const otherProfile =
          conn.requester === userId
            ? conn.addressee_profile
            : conn.profiles;

        return (
          <li
            key={conn.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
          >
            <span className="font-medium">
              {otherProfile?.username ?? "Unknown"}
            </span>
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              Connected
            </span>
          </li>
        );
      })}
    </ul>
  );
}
