"use client";

import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface BankLogoProps {
  compact?: boolean;
  subtitle?: string;
  className?: string;
  theme?: "light" | "dark";
}

export function BankLogo({
  compact = false,
  subtitle = "Private Banking",
  className,
  theme = "light",
}: BankLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-lg shadow-emerald-900/20",
          compact ? "h-11 w-11" : "h-14 w-14"
        )}
      >
        <div className="relative flex items-center justify-center">
          <Landmark className={cn(compact ? "h-5 w-5" : "h-7 w-7")} />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.18em] text-white">
            VFG
          </span>
        </div>
      </div>

      <div className={cn("min-w-0", compact ? "ml-3" : "ml-4")}>
        <p
          className={cn(
            "truncate font-bold leading-tight",
            theme === "dark" ? "text-white" : "text-gray-900 dark:text-white",
            compact ? "text-base" : "text-xl"
          )}
        >
          Valtier Finacial Group
        </p>
        <p
          className={cn(
            "truncate",
            theme === "dark" ? "text-white/70" : "text-gray-500 dark:text-gray-400",
            compact ? "text-[11px]" : "text-sm"
          )}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
