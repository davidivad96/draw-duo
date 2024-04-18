import { useLocation, useSearch } from "wouter";
import { generateUsername } from "unique-username-generator";
import { useSupabase } from "../hooks/useSupabase";
import Toast from "../components/Toast";
import { capitalize, getRandomElement } from "../utils";
import { ERROR_MESSAGES, IMAGE_NAMES } from "../constants";

const Home: React.FC = () => {
  const supabase = useSupabase();
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const error = searchParams.get("error");

  const onCreateNewRoom = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        name: capitalize(generateUsername(" ", 0, 20)),
        image_name: getRandomElement(IMAGE_NAMES),
      })
      .select("room_id")
      .single();
    if (!data || error) {
      return;
    }
    navigate(`/${data.room_id}`);
  };

  return (
    <>
      <div className="flex flex-1 flex-col justify-center items-stretch gap-2 max-w-sm">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={onCreateNewRoom}
        >
          Create new room
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={() => {}}
        >
          Join room
        </button>
      </div>
      {error && (
        <Toast
          message={
            ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES] ??
            "An unexpected error occurred"
          }
          type="error"
          onClose={() => navigate("/")}
        />
      )}
    </>
  );
};

export default Home;
