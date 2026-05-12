import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client. Server component'ler ve route handler'lardan kullanılır.
 * Next.js 15+ `cookies()` async; bu yüzden helper da async.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server component'tan çağrılırsa cookie yazılamaz — sessizce geç.
            // Middleware oturum yenilemeyi üstlenecek.
          }
        },
      },
    },
  );
}
