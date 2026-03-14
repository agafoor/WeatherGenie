import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/shared/Logo";
import { FileText, Database, Users, ArrowLeft } from "lucide-react";

const adminNav = [
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/genie-rooms", label: "Genie Rooms", icon: Database },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/chat");

  return (
    <div className="flex h-screen bg-background">
      <nav className="w-56 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <Logo />
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        <div className="flex-1 p-2 space-y-0.5">
          {adminNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </Link>
          ))}
        </div>
        <div className="p-2 border-t">
          <Link
            href="/chat"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            Back to Chat
          </Link>
        </div>
      </nav>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
