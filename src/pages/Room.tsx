import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useSupabase } from "../hooks/useSupabase";
import Game from "../components/Game";

type Props = { roomId: string };

const Room: React.FC<Props> = ({ roomId }) => {
  const supabase = useSupabase();
  const [, navigate] = useLocation();
  const [roomName, setRoomName] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("room_id, name")
        .eq("room_id", roomId)
        .maybeSingle();
      if (!data || error) {
        navigate("/?error=room_not_found");
      }
      setRoomName(data!.name);
    };
    fetchRoom();
  }, [navigate, roomId, supabase]);

  return (
    <div className="flex flex-1 flex-col justify-center items-center gap-8">
      <p className="text-xl">
        Room <span className="font-bold">{roomName}</span>
      </p>
      <Game roomId={roomId} />
    </div>
  );
};

export default Room;
