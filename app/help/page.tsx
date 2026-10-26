"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HelpRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/support");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Redirecting to Help Center...</p>
    </div>
  );
}
