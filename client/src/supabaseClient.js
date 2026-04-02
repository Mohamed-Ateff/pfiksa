import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "[Supabase] Missing environment variables.\n" +
      "Create client/.env.local with:\n" +
      "  REACT_APP_SUPABASE_URL=https://xxxx.supabase.co\n" +
      "  REACT_APP_SUPABASE_ANON_KEY=your-anon-key",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
