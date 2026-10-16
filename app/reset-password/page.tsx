"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { authService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { BankLogo } from "@/components/bank-logo";
import { CheckCircle2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase passes recovery tokens either via hash fragment or query params
    const handleAuthChange = () => {
      supabase.auth.onAuthStateChange(async (event) => {
        if (event === "PASSWORD_RECOVERY") {
          // User arrived via password recovery link
        }
      });
    };
    handleAuthChange();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await authService.updatePassword(password);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update password. Your reset link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-12 p-8 bg-card rounded-xl shadow-sm border border-border">
      <div className="mb-6 flex justify-center">
        <BankLogo subtitle="Account Recovery" />
      </div>

      {isSuccess ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 animate-in zoom-in-50 duration-300" />
          </div>
          <h2 className="text-2xl font-bold">Password Reset Successful!</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your password has been changed successfully. You will be redirected to the login page in a few seconds...
          </p>
          <div className="pt-4">
            <Button
              onClick={() => router.push("/login")}
              className="w-full"
            >
              Go to Login Now
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-emerald-600" />
            <h2 className="text-2xl font-bold text-center">Set New Password</h2>
          </div>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Please enter and confirm your new secure password.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Reset password form">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="At least 6 characters"
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
                placeholder="Re-enter your new password"
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
