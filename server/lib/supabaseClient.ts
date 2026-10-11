import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "http://localhost:54321";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "missing-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
