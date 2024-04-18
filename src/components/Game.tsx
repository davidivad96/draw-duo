import { useEffect, useState, useMemo } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useLocation } from "wouter";
import { generateUsername } from "unique-username-generator";
import { useSupabase } from "../hooks/useSupabase";
import SketchCanvas from "./SketchCanvas";
import Toast from "./Toast";
import { ToastType } from "../types";

type Props = { roomId: string };

const Game: React.FC<Props> = ({ roomId }) => {
  const supabase = useSupabase();
  const [, navigate] = useLocation();
  const [roomChannel, setRoomChannel] = useState<RealtimeChannel | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    display: boolean;
    message?: string;
    type?: ToastType;
  }>({ display: false });
  const [images, setImages] = useState<{ self: string; other: string }>({
    self: "",
    other: "",
  });
  const username = useMemo(() => generateUsername("_", 0, 10), []);
  const [selfHasFinished, otherHasFinished] = useMemo(
    () => [images.self.length > 0, images.other.length > 0],
    [images]
  );

  useEffect(() => {
    // Create a temporary channel to check if there are already 2 users in the room
    const tmpRoom = supabase.channel(`room:${roomId}`);
    tmpRoom.on("presence", { event: "sync" }, () => {
      if (Object.keys(tmpRoom.presenceState()).length >= 2) {
        supabase.removeChannel(tmpRoom);
        navigate("/?error=full_room");
      }
    });
    // Create a channel for the room and track the presence of users
    const room = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: username } },
    });
    setRoomChannel(room);
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
      .on(
        "broadcast",
        { event: "finish_drawing" },
        ({ payload: { base64image, message } }) => {
          setImages((prev) => ({ ...prev, other: base64image }));
          setToast({
            display: true,
            message,
            type: "info",
          });
        }
      )
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
  }, [navigate, roomId, supabase, username]);

  const onFinishDrawing = async (base64image: string) => {
    setImages((prev) => ({ ...prev, self: base64image }));
    if (roomChannel) {
      await roomChannel.send({
        type: "broadcast",
        event: "finish_drawing",
        payload: {
          base64image,
          message: "Your co-player has finished drawing!",
        },
      });
    }
  };

  if (users.length < 2) {
    return (
      <div>
        <h2>Connected Users:</h2>
        <ul>
          {users.map((user) => (
            <li key={user}>{user}</li>
          ))}
        </ul>
        <p>Waiting for another player to join...</p>
      </div>
    );
  }

  if (selfHasFinished && otherHasFinished) {
    return (
      <div className="flex flex-col items-center gap-2">
        <h2>Both players have finished drawing!</h2>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={() => navigate("/results")}
        >
          View results
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4 w-2/5 h-96">
        <h2>Game Started!</h2>
        <SketchCanvas
          onFinishDrawing={onFinishDrawing}
          finishDrawingButtonDisabled={selfHasFinished}
        />
        {selfHasFinished && (
          <p className="text-center">Waiting for your co-player to finish...</p>
        )}
      </div>
      {toast.display && (
        <Toast
          message={toast.message!}
          type={toast.type!}
          onClose={() => setToast({ display: false })}
        />
      )}
    </>
  );
};

export default Game;
