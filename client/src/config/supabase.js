import { createClient } from '@supabase/supabase-js';

// Supabase public config (anon key is safe for client-side — it only allows operations permitted by RLS policies)
const supabaseUrl = 'https://ymarvpwrpwbkkonhsdhm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYXJ2cHdycHdia2tvbmhzZGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MTU2MjMsImV4cCI6MjEwMDQ5MTYyM30.FHOV_bAzkOOuXTN3GXdYCkYFT92vUDovuozVT1WYawI';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
