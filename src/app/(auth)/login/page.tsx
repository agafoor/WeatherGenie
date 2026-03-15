"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CloudSun, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WeatherBackground } from "@/components/shared/WeatherBackground";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/chat");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      <WeatherBackground />

      <div className="relative z-10 w-full max-w-sm space-y-8 glass rounded-3xl p-8 shadow-xl shadow-sky-200/20 dark:shadow-sky-900/30">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-300 via-sky-400 to-sky-600 dark:from-sky-600 dark:to-sky-900 flex items-center justify-center shadow-lg shadow-sky-300/30">
                <CloudSun className="h-8 w-8 text-white drop-shadow" />
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-300/80 dark:bg-amber-500/40 animate-float" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent dark:from-sky-200 dark:to-sky-500">WeatherGenie</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 shadow-md shadow-sky-300/25 transition-all hover:shadow-lg" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-sky-600 dark:text-sky-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
