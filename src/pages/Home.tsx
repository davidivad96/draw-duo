import { useLocation } from "wouter";
import { useSupabase } from "../hooks/useSupabase";

const Home: React.FC = () => {
  const supabase = useSupabase();
  const [, navigate] = useLocation();

  const onCreateNewRoom = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .insert({})
      .select("room_id")
      .single();
    if (!data || error) {
      console.error(error);
      return;
    }
    navigate(`/${data.room_id}`);
  };

  return (
    <div className="flex flex-1 justify-center items-center">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
        onClick={onCreateNewRoom}
      >
        Create new room
      </button>
    </div>
  );
};

export default Home;
