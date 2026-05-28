import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://vueoehpextmueaxzeznh.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1ZW9laHBleHRtdWVheHplem5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MjkxOTEsImV4cCI6MjA5NTUwNTE5MX0.0Zl8Drd5sPrdJGwrQNST8AU6V0WRScCgB1NqFaME9CI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
