import { createClient } from "@supabase/supabase-js";

// Falls back to placeholder values so the app still renders (weather-only)
// when Supabase env vars haven't been configured yet; see supabase/schema.sql.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
