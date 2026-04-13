import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "https://nzbqlzapvmbflgpbsvgo.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56YnFsemFwdm1iZmxncGJzdmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODMzNjAsImV4cCI6MjA5MTY1OTM2MH0.VCdKfxKqJxNpNTWg-2P9TZiaw6tRSRbosjgjxcwzwuo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
