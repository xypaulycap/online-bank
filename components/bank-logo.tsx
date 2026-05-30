import Image from "next/image";
import { cn } from "@/lib/utils";

interface BankLogoProps {
  compact?: boolean;
  subtitle?: string; // Kept for backwards compatibility if passed
  className?: string;
  theme?: "light" | "dark"; // Kept for backwards compatibility if passed
}

export function BankLogo({
  compact = false,
  className,
}: BankLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("relative flex shrink-0 items-center", compact ? "h-10" : "h-16")}>
        <Image 
          src="/sig-logo.jpeg" 
          alt="Valtier Financial Group" 
          width={compact ? 150 : 240}
          height={compact ? 40 : 64}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
