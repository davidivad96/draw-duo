import { useLocation, useSearch } from "wouter";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useSupabase } from "../hooks/useSupabase";
import { ERROR_MESSAGES } from "../constants";
import { useEffect } from "react";

const Home: React.FC = () => {
  const supabase = useSupabase();
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [error, navigate]);

  const onCreateNewRoom = async () => {
    const { data, error } = await supabase
      .from("rooms")
      .insert({})
      .select("room_id")
      .single();
    if (!data || error) {
      return;
    }
    navigate(`/${data.room_id}`);
  };

  return (
    <>
      <div className="flex flex-1 justify-center items-center">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={onCreateNewRoom}
        >
          Create new room
        </button>
      </div>
      {error && (
        <div className="fixed flex justify-between items-center right-5 w-full max-w-xs p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100 dark:bg-gray-800 dark:text-red-400">
          <span className="font-normal text-md">
            Error:{" "}
            {ERROR_MESSAGES[error as keyof typeof ERROR_MESSAGES] ??
              "An unexpected error occurred"}
            .
          </span>
          <XMarkIcon
            className="w-5 h-5 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
      )}
    </>
  );
};

export default Home;
