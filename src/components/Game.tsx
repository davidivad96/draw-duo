import { useEffect, useState, useMemo, useCallback } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useLocation } from "wouter";
import { generateUsername } from "unique-username-generator";
import { useSupabase } from "../hooks/useSupabase";
import SketchCanvas from "./SketchCanvas";
import Toast from "./Toast";
import Results from "./Results";
import { ToastType } from "../types";
import { getRandomElement } from "../utils";
import { IMAGE_NAMES } from "../constants";

type Props = {
  roomId: string;
  imageName: string;
  setImageName: (newImageName: string) => void;
};

const Game: React.FC<Props> = ({ roomId, imageName, setImageName }) => {
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
  const [wantToPlayAgain, setWantToPlayAgain] = useState<{
    self: boolean;
    other: boolean;
  }>({ self: false, other: false });
  const [selfHasFinished, otherHasFinished] = useMemo(
    () => [images.self.length > 0, images.other.length > 0],
    [images]
  );
  const username = useMemo(() => generateUsername("_", 0, 10), []);

  const resetGame = useCallback(async () => {
    setImages({ self: "", other: "" });
    setToast({
      display: true,
      message: "Game has been reset!",
      type: "info",
    });
    const newImageName = getRandomElement(IMAGE_NAMES);
    await supabase
      .from("rooms")
      .update({ image_name: newImageName })
      .eq("room_id", roomId);
    setImageName(newImageName);
  }, [roomId, setImageName, supabase]);

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
      .on("broadcast", { event: "reset_game" }, () => {
        setWantToPlayAgain((prev) => {
          if (prev.self) {
            resetGame();
            return { self: false, other: false };
          }
          setToast({
            display: true,
            message: "Your co-player wants to play again!",
            type: "info",
          });
          return { ...prev, other: true };
        });
      })
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms" },
        ({ new: { image_name } }) => {
          setImageName(image_name);
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
  }, [navigate, resetGame, roomId, setImageName, supabase, username]);

  useEffect(() => {
    const updateLastRoundAt = async () => {
      await supabase
        .from("rooms")
        .update({ last_round_at: new Date().toISOString() })
        .eq("room_id", roomId);
    };
    if (selfHasFinished && otherHasFinished) {
      updateLastRoundAt();
    }
  }, [selfHasFinished, otherHasFinished, supabase, roomId]);

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

  const onPlayAgain = async () => {
    setWantToPlayAgain((prev) => {
      if (prev.other) {
        resetGame();
        return { self: false, other: false };
      }
      return { ...prev, self: true };
    });
    if (roomChannel) {
      await roomChannel.send({
        type: "broadcast",
        event: "reset_game",
        payload: {},
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
      <>
        <div className="flex flex-col items-center gap-2">
          <h2>Result:</h2>
          <Results
            left={users[0] === username ? images.self : images.other}
            right={users[1] === username ? images.self : images.other}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded disabled:opacity-50"
            onClick={onPlayAgain}
            disabled={wantToPlayAgain.self}
          >
            Play Again
          </button>
          {wantToPlayAgain.self && (
            <p className="text-center">Waiting for your co-player...</p>
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
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4 w-2/5">
        <h2>Game Started!</h2>
        <p className="text-center">
          Draw the {users[0] === username ? "left" : "right"} part of the
          reference image:
        </p>
        <img
          src={`src/assets/${imageName}.png`}
          alt="Reference image"
          className="max-w-full"
        />
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
