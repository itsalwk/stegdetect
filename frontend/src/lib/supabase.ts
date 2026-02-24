import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;

/**
 * Helper to upload a file to a Supabase bucket.
 * Returns the public URL or null if upload fails/Supabase not configured.
 */
export async function uploadToSupabase(file: File, bucket: string = 'stego-uploads'): Promise<string | null> {
  if (!supabase) {
    console.warn("Supabase not configured. Skipping upload.");
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Supabase upload error:", error);
    return null;
  }
}

/**
 * Add an entry to the stego history.
 */
export async function addHistoryEntry(entry: {
  filename: string,
  type: string,
  status: string,
  carrier_url?: string,
  result_url?: string,
  details?: any
}) {
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('stego_history')
    .insert([
      { 
        ...entry,
        user_id: user.id 
      }
    ])
    .select();

  if (error) {
    console.error("Error adding history entry:", error);
    return null;
  }

  return data[0];
}

/**
 * Fetch the current user's stego history.
 */
export async function fetchHistory() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('stego_history')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching history:", error);
    return [];
  }

  return data;
}
