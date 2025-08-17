import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient<Database>> | null = null as any;

if (supabaseUrl && supabaseAnonKey) {
	supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
		auth: {
			storage: localStorage,
			persistSession: true,
			autoRefreshToken: true,
		}
	});
} else {
	console.warn('Supabase environment variables missing. Image upload features will be disabled.');
	// Minimal stub that rejects upload operations gracefully
	const stub = {
		storage: {
			from: () => ({
				upload: async () => { throw new Error('Supabase not configured'); },
				getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } })
			})
		}
	} as unknown as ReturnType<typeof createClient<Database>>;
	// @ts-expect-error: assigning stub for runtime safety
	supabase = stub;
}

// Export named constant for existing imports
export { supabase };