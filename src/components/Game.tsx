import { useEffect, useState, useMemo, useCallback } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useLocation } from "wouter";
import { generateUsername } from "unique-username-generator";
import { useSupabase } from "../hooks/useSupabase";
import SketchCanvas from "./SketchCanvas";
import Toast from "./Toast";
import Chat from "./Chat";
import ResultsSplitDraw from "./ResultsSplitDraw";
import ResultsCopycat from "./ResultsCopycat";
import { GameMode, ToastType } from "../types";
import { getRandomElement } from "../utils";
import { IMAGE_NAMES } from "../constants";

type Props = {
  roomId: string;
  imageName: string;
  setImageName: (newImageName: string) => void;
  gameMode: GameMode;
};

const Game: React.FC<Props> = ({
  roomId,
  imageName,
  setImageName,
  gameMode,
}) => {
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
  const [messages, setMessages] = useState<{ text: string; self: boolean }[]>(
    []
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
  }, [roomId, supabase]);

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
        setUsers((prev) => {
          if (prev.length < 3) {
            setToast({
              display: true,
              message: "Your friend has left the room!",
              type: "info",
            });
          }
          return prev.filter((user) => user !== key);
        });
      })
      .on(
        "broadcast",
        { event: "finish_drawing" },
        ({ payload: { base64image, message } }) => {
          setImages((prev) => {
            if (prev.self.length === 0) {
              setToast({
                display: true,
                message,
                type: "info",
              });
            }
            return { ...prev, other: base64image };
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
            message: "Your friend wants to play again!",
            type: "info",
          });
          return { ...prev, other: true };
        });
      })
      .on(
        "broadcast",
        { event: "chat_message" },
        ({ payload: { message } }) => {
          setMessages((prev) => [...prev, { text: message, self: false }]);
        }
      )
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
          message: "Your friend has finished drawing!",
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

  const onSendChatMessage = async (message: string) => {
    setMessages((prev) => [...prev, { text: message, self: true }]);
    if (roomChannel) {
      await roomChannel.send({
        type: "broadcast",
        event: "chat_message",
        payload: { message },
      });
    }
  };

  if (users.length < 2) {
    return (
      <>
        <div className="flex flex-col items-center gap-4">
          <h2 className="underline">You are connected!</h2>
          <p>Waiting for another player to join...</p>
          <p>Share this link with your friend:</p>
          <code>{window.location.href}</code>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded disabled:opacity-50"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setToast({
                display: true,
                message: "Link has been copied!",
                type: "info",
              });
            }}
          >
            Copy link
          </button>
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

  if (selfHasFinished && otherHasFinished) {
    return (
      <>
        <div className="flex flex-col items-center gap-4">
          <p className="font-bold">Result:</p>
          <div className="flex flex-row items-center gap-4">
            <Chat messages={messages} sendMessage={onSendChatMessage} />
            {gameMode === "split-draw" ? (
              <ResultsSplitDraw
                left={users[0] === username ? images.self : images.other}
                right={users[1] === username ? images.self : images.other}
                reference={`src/assets/${imageName}.png`}
              />
            ) : (
              <ResultsCopycat
                self={images.self}
                other={images.other}
                reference={`src/assets/${imageName}.png`}
              />
            )}
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded disabled:opacity-50"
            onClick={onPlayAgain}
            disabled={wantToPlayAgain.self}
          >
            Play Again
          </button>
          {wantToPlayAgain.self && (
            <p className="text-center">Waiting for your friend...</p>
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
      <div className="flex flex-row justify-around items-center gap-4 w-full">
        <Chat messages={messages} sendMessage={onSendChatMessage} />
        <div className="flex flex-col items-center gap-2">
          <p className="text-center">
            {gameMode === "split-draw"
              ? `Draw the ${
                  users[0] === username ? "left" : "right"
                } part of the
            reference image:`
              : "Draw the reference image:"}
          </p>
          <img
            src={`src/assets/${imageName}.png`}
            alt="Reference image"
            className="w-1/3 min-w-60"
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <SketchCanvas
            onFinishDrawing={onFinishDrawing}
            finishDrawingButtonDisabled={selfHasFinished}
          />
          {selfHasFinished && (
            <p className="text-center">Waiting for your friend to finish...</p>
          )}
        </div>
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
