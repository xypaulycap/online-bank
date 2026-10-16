"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { authService } from "@/lib/supabase-services";
import { BankLogo } from "@/components/bank-logo";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.resetPasswordForEmail(email);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-12 p-8 bg-card rounded-xl shadow-sm border border-border">
      <div className="mb-6 flex justify-center">
        <BankLogo subtitle="Security & Account Recovery" />
      </div>

      {isSubmitted ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 animate-in zoom-in-50 duration-300" />
          </div>
          <h2 className="text-2xl font-bold">Check Your Email</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We have sent a password reset link to{" "}
            <span className="font-semibold text-foreground">{email}</span>.
            Please follow the instructions in the email to reset your password.
          </p>
          <div className="pt-4">
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-2 text-center">Forgot Password?</h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Enter your registered email address and we'll send you a link to reset your password.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Forgot password form">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
                placeholder="name@example.com"
                aria-describedby="email-error"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
