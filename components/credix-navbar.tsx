"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";

export function CredixNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Fixed Login/Register Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden mb-0">
        <Link
          href="/login"
          className="flex-1 px-6 py-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl text-primary-600 dark:text-primary-400 font-semibold shadow-lg border border-primary-200 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors text-center"
        >
          <i className="fa-solid fa-sign-in-alt mr-2"></i>
          Login
        </Link>
        <Link
          href="/signup"
          className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg transition-colors text-center"
        >
          <i className="fa-solid fa-user-plus mr-2"></i>
          Register
        </Link>
      </div>

      {/* Navigation Header */}
      <nav className="relative bg-gradient-to-r from-white via-primary-50 to-white dark:from-gray-900 dark:via-primary-900 dark:to-gray-900 backdrop-blur-xl border-b border-gradient-to-r from-transparent via-primary-200/50 to-transparent dark:border-primary-700/30 sticky top-0 z-50 shadow-lg shadow-primary-500/5">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-primary-200/20 dark:bg-primary-800/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -top-5 right-1/4 w-16 h-16 bg-teal-200/20 dark:bg-teal-800/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Logo */}
            <div className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-400/20 rounded-xl blur-lg group-hover:bg-primary-400/30 transition-all duration-300"></div>
                <Link href="/">
                  <Image
                    src="https://credix.deckmaxx.top/storage/app/public/photos/ld5cTft2xx1jZ1PGQFo5qM2UVT85tmHmm2YyddqC.png"
                    alt="Credix Vault Bank"
                    width={120}
                    height={40}
                    className="relative h-10 lg:h-10 w-auto"
                  />
                </Link>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                href="/"
                className={`relative px-4 py-2 font-medium transition-all duration-300 group ${
                  isActive("/")
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                <span className="relative z-10">Home</span>
                <div className={`absolute inset-0 bg-primary-50 dark:bg-primary-900/30 rounded-xl transition-transform duration-300 origin-center ${
                  isActive("/") ? "scale-100" : "scale-0 group-hover:scale-100"
                }`}></div>
              </Link>
              <Link
                href="/about"
                className={`relative px-4 py-2 font-medium transition-all duration-300 group ${
                  isActive("/about")
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                <span className="relative z-10">About</span>
                <div className={`absolute inset-0 bg-primary-50 dark:bg-primary-900/30 rounded-xl transition-transform duration-300 origin-center ${
                  isActive("/about") ? "scale-100" : "scale-0 group-hover:scale-100"
                }`}></div>
              </Link>
              <div className="relative group">
                <button className={`relative px-4 py-2 font-medium transition-all duration-300 flex items-center ${
                  isActive("/services")
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                }`}>
                  <span className="relative z-10">Services</span>
                  <i className="fa-solid fa-chevron-down ml-1 text-xs group-hover:rotate-180 transition-transform duration-300"></i>
                  <div className={`absolute inset-0 bg-primary-50 dark:bg-primary-900/30 rounded-xl transition-transform duration-300 origin-center ${
                    isActive("/services") ? "scale-100" : "scale-0 group-hover:scale-100"
                  }`}></div>
                </button>
                {/* Services Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="p-2">
                    <Link
                      href="/chart"
                      className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all duration-300"
                    >
                      <i className="fa-solid fa-user mr-3 text-primary-500"></i>
                      Personal Banking
                    </Link>
                    <Link
                      href="/alerts"
                      className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all duration-300"
                    >
                      <i className="fa-solid fa-briefcase mr-3 text-blue-500"></i>
                      Business Banking
                    </Link>
                    <Link
                      href="/send-money"
                      className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all duration-300"
                    >
                      <i className="fa-solid fa-handshake mr-3 text-green-500"></i>
                      Loans & Credit
                    </Link>
                    <Link
                      href="/dashboard/cards"
                      className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all duration-300"
                    >
                      <i className="fa-solid fa-credit-card mr-3 text-purple-500"></i>
                      Cards
                    </Link>
                    <Link
                      href="/grants"
                      className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all duration-300"
                    >
                      <i className="fa-solid fa-hand-holding-dollar mr-3 text-orange-500"></i>
                      Grants & Aid
                    </Link>
                  </div>
                </div>
              </div>
              <Link
                href="/contact"
                className={`relative px-4 py-2 font-medium transition-all duration-300 group ${
                  isActive("/contact")
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                <span className="relative z-10">Contact</span>
                <div className={`absolute inset-0 bg-primary-50 dark:bg-primary-900/30 rounded-xl transition-transform duration-300 origin-center ${
                  isActive("/contact") ? "scale-100" : "scale-0 group-hover:scale-100"
                }`}></div>
              </Link>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="relative p-3 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-300 hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
              >
                {mounted && theme === "dark" ? (
                  <i className="fa-solid fa-sun text-lg group-hover:rotate-180 transition-transform duration-500"></i>
                ) : (
                  <i className="fa-solid fa-moon text-lg group-hover:rotate-12 transition-transform duration-300"></i>
                )}
              </button>

              {/* Login Button */}
              <Link
                href="/login"
                className="relative px-4 py-2.5 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-all duration-300 group"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </Link>

              {/* Open Account Button */}
              <Link
                href="/signup"
                className="relative px-6 py-2.5 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 hover:from-primary-700 hover:via-primary-600 hover:to-primary-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/40 hover:-translate-y-0.5 group overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  <i className="fa-solid fa-sparkles mr-2 group-hover:animate-spin"></i>
                  Open Account
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden relative p-3 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              {mobileMenuOpen ? (
                <i className="fa-solid fa-times text-lg transition-transform duration-300"></i>
              ) : (
                <i className="fa-solid fa-bars text-lg transition-transform duration-300"></i>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-gradient-to-br from-white via-primary-50 to-white dark:from-gray-900 dark:via-primary-900 dark:to-gray-900 backdrop-blur-xl border-t border-primary-200/70 dark:border-primary-700/50 shadow-2xl shadow-primary-500/20">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary-200/20 dark:bg-primary-800/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-teal-200/20 dark:bg-teal-800/20 rounded-full blur-xl"></div>
            </div>

            <div className="relative px-6 py-6 space-y-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 font-medium transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30 hover:shadow-lg hover:translate-x-2 group ${
                  isActive("/")
                    ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                <i className="fa-solid fa-home mr-4 text-primary-500 group-hover:scale-110 transition-transform duration-300"></i>
                <span>Home</span>
                <i className="fa-solid fa-chevron-right ml-auto text-xs opacity-0 group-hover:opacity-100 transition-all duration-300"></i>
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 font-medium transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30 hover:shadow-lg hover:translate-x-2 group ${
                  isActive("/about")
                    ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                <i className="fa-solid fa-info-circle mr-4 text-teal-500 group-hover:scale-110 transition-transform duration-300"></i>
                <span>About</span>
                <i className="fa-solid fa-chevron-right ml-auto text-xs opacity-0 group-hover:opacity-100 transition-all duration-300"></i>
              </Link>

              {/* Services Submenu */}
              <div className="space-y-2">
                <button
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className={`flex items-center w-full px-4 py-3 font-medium transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30 hover:shadow-lg hover:translate-x-2 group ${
                    isActive("/services")
                      ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  }`}
                >
                  <i className="fa-solid fa-cogs mr-4 text-purple-500 group-hover:scale-110 transition-transform duration-300"></i>
                  <span>Services</span>
                  <i
                    className={`fa-solid fa-chevron-down ml-auto text-xs transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`}
                  ></i>
                </button>
                {servicesOpen && (
                  <div className="ml-8 space-y-1">
                    <Link
                      href="/chart"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30"
                    >
                      <i className="fa-solid fa-user mr-3 text-primary-400"></i>
                      Personal Banking
                    </Link>
                    <Link
                      href="/alerts"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30"
                    >
                      <i className="fa-solid fa-briefcase mr-3 text-blue-400"></i>
                      Business Banking
                    </Link>
                    <Link
                      href="/send-money"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30"
                    >
                      <i className="fa-solid fa-handshake mr-3 text-green-400"></i>
                      Loans & Credit
                    </Link>
                    <Link
                      href="/dashboard/cards"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30"
                    >
                      <i className="fa-solid fa-credit-card mr-3 text-purple-400"></i>
                      Cards
                    </Link>
                    <Link
                      href="/grants"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30"
                    >
                      <i className="fa-solid fa-hand-holding-dollar mr-3 text-orange-400"></i>
                      Grants & Aid
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 font-medium transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30 hover:shadow-lg hover:translate-x-2 group ${
                  isActive("/contact")
                    ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                <i className="fa-solid fa-envelope mr-4 text-orange-500 group-hover:scale-110 transition-transform duration-300"></i>
                <span>Contact</span>
                <i className="fa-solid fa-chevron-right ml-auto text-xs opacity-0 group-hover:opacity-100 transition-all duration-300"></i>
              </Link>

              {/* Dark Mode Toggle for Mobile */}
              <div className="pt-4 mt-4 border-t border-primary-700/50">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-all duration-300 rounded-2xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30 hover:shadow-lg hover:translate-x-2 group"
                >
                  <div className="flex items-center justify-center w-8 h-8 mr-4 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-blue-500 dark:to-purple-600 group-hover:scale-110 transition-transform duration-300">
                    {mounted && theme === "dark" ? (
                      <i className="fa-solid fa-sun text-white text-sm group-hover:rotate-180 transition-transform duration-500"></i>
                    ) : (
                      <i className="fa-solid fa-moon text-white text-sm group-hover:rotate-12 transition-transform duration-300"></i>
                    )}
                  </div>
                  <span>{mounted && theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
                  <i className="fa-solid fa-chevron-right ml-auto text-xs opacity-0 group-hover:opacity-100 transition-all duration-300"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

