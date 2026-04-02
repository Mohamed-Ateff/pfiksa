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

// Keep-alive ping every 4 days to prevent Supabase free tier from pausing
const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;
setInterval(async () => {
  try {
    await supabase.from("profiles").select("id").limit(1);
  } catch (_) {}
}, FOUR_DAYS_MS);
