import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pmicuhnocedcsxtzvqdd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaWN1aG5vY2VkY3N4dHp2cWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzQ4OTQsImV4cCI6MjA4NzI1MDg5NH0.vZ-EyegjlkkgYb_slrl8tg5wUhAyodp9y6SzaeBOV2Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export { SUPABASE_URL };
