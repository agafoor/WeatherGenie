"use client";

import { useRouter } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

interface UserMenuProps {
  profile: Profile;
}

export function UserMenu({ profile }: UserMenuProps) {
  const router = useRouter();
  const supabase = createClient();

  const initials = (profile.display_name || profile.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-sky-500 text-white text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-2">
          <p className="font-semibold text-sm">{profile.display_name || "User"}</p>
          <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
        </div>
        <DropdownMenuSeparator />
        {profile.role === "admin" && (
          /* Use onSelect + router.push — works with all Base UI / Radix versions */
          <DropdownMenuItem onSelect={() => router.push("/admin/documents")}>
            <Shield className="mr-2 h-4 w-4 text-sky-500" />
            Admin Panel
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
