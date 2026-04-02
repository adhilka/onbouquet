import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  // Use environment variables if available, otherwise fallback to hardcoded keys
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dddtdlabomhawbmanqdr.supabase.co";
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZHRkbGFib21oYXdibWFucWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMzc2OTUsImV4cCI6MjA5MDcxMzY5NX0.a0-5es2XJomOTrJ9QyoHnTYt_w4CZsfnnjTCpwYpMdA";

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "https://your-project-id.supabase.co") {
    throw new Error('Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

/**
 * Storage Helper
 * 
 * To use Supabase Storage, you must first create a bucket in the Supabase Dashboard.
 * Example: 'bouquets'
 */
export const storage = {
  /**
   * Upload a file to a bucket
   * @param bucket The name of the bucket (e.g., 'bouquets')
   * @param path The path within the bucket
   * @param file The file object or blob
   * 
   * NOTE: You must create the bucket in the Supabase Dashboard first.
   */
  async upload(bucket: string, path: string, file: File | Blob) {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    return data;
  },

  /**
   * Get the public URL for a file
   * @param bucket The name of the bucket
   * @param path The path within the bucket
   */
  getPublicUrl(bucket: string, path: string) {
    const supabase = getSupabase();
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
};
