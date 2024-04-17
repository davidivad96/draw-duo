import { useEffect } from "react";
import { useLocation } from "wouter";
import { useSupabase } from "../hooks/useSupabase";

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
    <div className="flex flex-1 justify-center items-center">
      <h1>Room {roomId}</h1>
    </div>
  );
};

export default Room;
