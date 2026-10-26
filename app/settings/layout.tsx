"use client";

import { UserLayout } from "@/components/user-layout";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
