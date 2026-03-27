import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Using fallback mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://zmielhwnyvwnjdrievim.supabase.co',
  supabaseAnonKey || 'sb_publishable_qL3vmgQAT4n1Ibr3Xb1d8Q_HW7gofdn'
);
