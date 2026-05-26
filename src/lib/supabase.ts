import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hppzxppssmhhaefwqffg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHp4cHBzc21oaGFlZndxZmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MjAwMjYsImV4cCI6MjA5NDE5NjAyNn0.BO_dTDWp2-vV_JUUYsxVl2TaLFUdX2LsuA_8o8DYOkg'

// Initialize the secure, authenticated client used across the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Security Upgrade: supabaseAdmin is now mapped to standard supabase to utilize
// Row Level Security (RLS) policies based on the logged-in user's role/session.
// The raw service_role key has been permanently removed from the client bundle.
export const supabaseAdmin = supabase
