import { useEffect } from "react";
import { useLocation } from "wouter";
import { useSupabase } from "../hooks/useSupabase";
import ConnectedUsers from "../components/ConnectedUsers";

type Props = { roomId: string };

const Room: React.FC<Props> = ({ roomId }) => {
  const supabase = useSupabase();
  const [, navigate] = useLocation();

  useEffect(() => {
    const fetchRoom = async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("room_id")
        .eq("room_id", roomId)
        .maybeSingle();

      if (!data || error) {
        navigate("/");
      }
    };
    fetchRoom();
  }, [navigate, roomId, supabase]);

  return (
    <div className="flex flex-1 flex-col justify-center items-center gap-8">
      <h1>Room {roomId}</h1>
      <ConnectedUsers roomId={roomId} />
    </div>
  );
};

export default Room;
