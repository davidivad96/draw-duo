import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { generateUsername } from "unique-username-generator";
import { useSupabase } from "../hooks/useSupabase";

type Props = { roomId: string };

const ConnectedUsers: React.FC<Props> = ({ roomId }) => {
  const supabase = useSupabase();
  const [, navigate] = useLocation();
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    // Create a temporary channel to check if there are already 2 users in the room
    const tmpRoom = supabase.channel(`room:${roomId}`);
    tmpRoom.on("presence", { event: "sync" }, () => {
      if (Object.keys(room.presenceState()).length >= 2) {
        supabase.removeChannel(tmpRoom);
        navigate("/?error=full_room");
      }
    });
    // Create a channel for the room and track the presence of users
    const room = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: generateUsername("_", 0, 10) } },
    });
    room
      .on("presence", { event: "sync" }, () => {
        setUsers(Object.keys(room.presenceState()));
      })
      .on("presence", { event: "join" }, ({ key }) => {
        setUsers((prev) => [...prev, key]);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setUsers((prev) => prev.filter((user) => user !== key));
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }
        await room.track({});
      });
    return () => {
      room.untrack();
      supabase.removeChannel(room);
    };
  }, [navigate, roomId, supabase]);

  return (
    <div>
      <h2>Connected Users:</h2>
      <ul>
        {users.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
    </div>
  );
};

export default ConnectedUsers;
