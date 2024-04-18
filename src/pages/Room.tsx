import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useSupabase } from "../hooks/useSupabase";
import Game from "../components/Game";
import { GameMode } from "../types";

type Props = { roomId: string };

const Room: React.FC<Props> = ({ roomId }) => {
  const supabase = useSupabase();
  const [, navigate] = useLocation();
  const [roomName, setRoomName] = useState<string>("");
  const [imageName, setImageName] = useState<string>("flower_pot");
  const [gameMode, setGameMode] = useState<GameMode>("split-draw");

  useEffect(() => {
    const fetchRoom = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("room_id, name, image_name, game_mode")
        .eq("room_id", roomId)
        .maybeSingle();

      if (!data || error) {
        navigate("/?error=room_not_found");
      }
      setRoomName(data!.name);
      setImageName(data!.image_name);
      setGameMode(data!.game_mode);
    };
    fetchRoom();
  }, [navigate, roomId, supabase]);

  return (
    <div className="flex flex-1 flex-col justify-start items-center gap-8 w-full">
      <p className="text-xl">
        Room <span className="font-bold">{roomName}</span>
      </p>
      <Game
        roomId={roomId}
        imageName={imageName}
        setImageName={setImageName}
        gameMode={gameMode}
      />
    </div>
  );
};

export default Room;
