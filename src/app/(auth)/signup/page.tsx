"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CloudSun, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WeatherBackground } from "@/components/shared/WeatherBackground";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
        <WeatherBackground />
        <div className="relative z-10 w-full max-w-sm space-y-6 text-center glass rounded-3xl p-8 shadow-xl shadow-sky-200/20 dark:shadow-sky-900/30">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 dark:from-emerald-600 dark:to-emerald-900 flex items-center justify-center shadow-lg shadow-emerald-300/30">
              <CheckCircle2 className="h-8 w-8 text-white drop-shadow" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a confirmation link to <strong>{email}</strong>. Click it
              to activate your account.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Back to Sign In
          </Button>
        </div>
      </div>
    );
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
            Create your account
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Display Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-600 hover:to-sky-500 shadow-md shadow-sky-300/25 transition-all hover:shadow-lg" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-sky-600 dark:text-sky-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
