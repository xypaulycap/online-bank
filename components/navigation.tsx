"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Moon, Sun, Bell, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BankLogo } from "@/components/bank-logo";
import { GoogleTranslate } from "@/components/google-translate";

interface NavigationProps {
  children: React.ReactNode;
}

export function Navigation({ children }: NavigationProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  // Marketing/landing pages that use their own navigation
  const marketingPages = ["/", "/about", "/services", "/contact", "/chart", "/alerts", "/send-money", "/grants"];
  // Authenticated app pages that use UserSidebar — skip the Navigation wrapper for all of them
  const authenticatedPrefixes = [
    "/dashboard", "/profile", "/settings", "/accounts", "/transfers",
    "/wire-transfer", "/transaction-history", "/pending-transactions",
    "/notifications", "/cards", "/kyc", "/deposit", "/support",
    "/help", "/statement", "/transfer-success", "/send-money",
  ];
  const isAuthenticatedPage = pathname ? authenticatedPrefixes.some((p) => pathname.startsWith(p)) : false;
  const isMarketingPage = (pathname && marketingPages.includes(pathname)) || isAuthenticatedPage;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/accounts", label: "Accounts" },
    { href: "/transactions", label: "Transactions" },
  ];

  if (!isMounted) {
    return null;
  }

  // Skip Navigation component for marketing pages - they use their own navbar
  if (isMarketingPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          {/* Desktop Left: Logo and Nav links */}
          <div className="mr-4 hidden md:flex items-center">
            <Link href="/" className="mr-6 flex items-center">
              <BankLogo compact subtitle="Secure Online Banking" />
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Mobile Left: Logo */}
          <div className="flex md:hidden items-center">
            <Link href="/" className="flex items-center">
              <BankLogo compact subtitle="Secure Online Banking" />
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Desktop Action Items (Login & Google Translate) */}
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="outline" asChild size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <GoogleTranslate id="google_translate_nav" className="hidden md:inline-flex" />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Drawer (Google Translate accessible inside) */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-6 flex flex-col justify-between">
                  <div>
                    <SheetHeader className="mb-6 text-left">
                      <SheetTitle>
                        <BankLogo compact subtitle="Secure Online Banking" />
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col space-y-3">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            pathname === item.href
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-foreground/70 hover:bg-muted"
                          )}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </div>

                  <div className="pt-6 border-t border-border space-y-4">
                    <label
                      htmlFor="google_translate_nav_mobile_select"
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-2.5 cursor-pointer"
                    >
                      <span className="text-xs font-medium text-muted-foreground flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Language
                      </span>
                      <GoogleTranslate id="google_translate_nav_mobile" selectId="google_translate_nav_mobile_select" />
                    </label>
                    <Button variant="default" className="w-full" asChild onClick={() => setMobileMenuOpen(false)}>
                      <Link href="/login">Login</Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  );
} 
