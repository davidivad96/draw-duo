import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

const { VITE_SUPABASE_API_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;

let client: SupabaseClient<Database>;

export const useSupabase = () => {
  if (client) {
    return client;
  }
  client = createClient<Database>(
    VITE_SUPABASE_API_URL,
    VITE_SUPABASE_ANON_KEY,
  );
  return client;
};
