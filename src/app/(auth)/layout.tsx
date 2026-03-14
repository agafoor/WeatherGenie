// Force dynamic rendering for all auth pages so they're never statically
// pre-rendered during `next build` (Supabase clients need runtime env vars).
export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
