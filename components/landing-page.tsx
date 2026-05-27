"use client";

import Link from "next/link";
import Image from "next/image";
import { CredixNavbar } from "@/components/credix-navbar";

export function LandingPage() {
  return (
    <div className="font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <CredixNavbar />

      {/* Hero Section */}
        <section className="relative h-screen min-h-[500px] lg:min-h-[600px] flex items-center justify-center overflow-hidden bg-primary-900">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/banking-hero.jpg"
              alt="Modern banking experience"
              fill
              className="object-cover object-[75%_25%] md:object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 lg:hidden"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30 lg:from-black/70 lg:via-black/50 lg:to-transparent"></div>
          </div>

          {/* Content Container */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex items-center min-h-[400px] lg:min-h-[500px]">
              <div className="text-white w-full lg:w-1/2 text-center lg:text-left">
                {/* Mobile Logo Icon */}
                <div className="lg:hidden flex justify-center mb-6">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                    <i className="fa-solid fa-university text-2xl text-white"></i>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 lg:mb-6">
                  Credix Vault Bank
                </h1>

                <p className="lg:hidden text-primary-100 text-lg font-medium mb-6">Your Digital Banking Partner</p>
                <p className="lg:hidden">We do banking differently. We believe that people come first, and that everyone deserves a great experience every step of the way.</p>
                <br />

                <p className="hidden lg:block text-xl text-gray-200 mb-8 max-w-2xl leading-relaxed">
                  We do banking differently. We believe that people come first, and that everyone deserves a great experience every step of the way.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-8 lg:mb-12">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl lg:rounded-2xl transition-all duration-300 shadow-2xl shadow-primary-600/30 hover:shadow-primary-600/50 hover:-translate-y-1 hover:scale-105"
                  >
                    <i className="fa-solid fa-user-plus mr-2 lg:mr-3"></i>
                    Open Account Today
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-xl lg:rounded-2xl transition-all duration-300 border border-white/30 hover:border-white/50 hover:-translate-y-1"
                  >
                    <i className="fa-solid fa-sign-in-alt mr-2 lg:mr-3"></i>
                    Login to Banking
                  </Link>
                </div>

                {/* Mobile Stats */}
                <div className="lg:hidden grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">50K+</p>
                    <p className="text-xs text-primary-100">Happy Customers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">$2.5B+</p>
                    <p className="text-xs text-primary-100">Assets Managed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info Cards - Hidden on Mobile */}
          <div className="hidden lg:block absolute bottom-0 left-0 right-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-3 gap-4 pb-8">
                <div className="bg-primary-600 hover:bg-primary-700 transition-all duration-300 rounded-2xl p-6 text-white shadow-2xl hover:shadow-primary-600/30 hover:-translate-y-2 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary-100 text-sm font-medium mb-1">ROUTING #</p>
                      <p className="text-2xl font-bold">251480576</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-university text-xl"></i>
                    </div>
                  </div>
                </div>

                <div className="bg-teal-500 hover:bg-teal-600 transition-all duration-300 rounded-2xl p-6 text-white shadow-2xl hover:shadow-teal-500/30 hover:-translate-y-2 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-100 text-sm font-medium mb-1">BRANCH HOURS</p>
                      <p className="text-lg font-bold">Mon-Fri: 9AM-5PM</p>
                      <p className="text-sm text-teal-100">Sat: 9AM-1PM</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-clock text-xl"></i>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 rounded-2xl p-6 text-white shadow-2xl hover:shadow-purple-600/30 hover:-translate-y-2 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium mb-1">24/7 SUPPORT</p>
                      <p className="text-lg font-bold">1-800-BANKING</p>
                      <p className="text-sm text-purple-100">Always here to help</p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-phone text-xl"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
            </div>
          </div>
        </section>

        {/* Rates Section */}
        <section className="relative py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-primary-900/20 overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 dark:bg-primary-800 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200 dark:bg-teal-800 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1000ms" }}></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4 shadow-lg backdrop-blur-sm border border-primary-200/50 dark:border-primary-700/50">
                <i className="fa-solid fa-chart-line mr-2 animate-pulse"></i>
                Credix Vault Bank Rates
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-gray-900 dark:from-white dark:via-primary-300 dark:to-white bg-clip-text text-transparent mb-4">
                Credix Vault Bank Member Care
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover competitive rates designed to help your money grow faster
              </p>
            </div>

            {/* Rates Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* High Yield Savings */}
              <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300/50 dark:hover:border-primary-600/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <i className="fa-solid fa-piggy-bank text-xl text-primary-600 dark:text-primary-400"></i>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">3.75%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">APY*</div>
                    <div className="font-bold text-gray-900 dark:text-white mb-2 text-sm">HIGH YIELD SAVINGS</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">High Yield Savings Rate</div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold shadow-sm">
                      <i className="fa-solid fa-star mr-1 animate-pulse"></i>
                      FEATURED
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificate */}
              <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-200/50 dark:border-gray-700/50 hover:border-teal-300/50 dark:hover:border-teal-600/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/50 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <i className="fa-solid fa-certificate text-xl text-teal-600 dark:text-teal-400"></i>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 to-green-600 dark:from-teal-400 dark:to-green-400 bg-clip-text text-transparent mb-2">3.65%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">APY*</div>
                    <div className="font-bold text-gray-900 dark:text-white mb-2 text-sm">18 MONTH CERTIFICATE</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Credix Vault Bank Certificate Rates</div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-teal-100 to-teal-200 dark:from-teal-900/30 dark:to-teal-800/30 text-teal-700 dark:text-teal-400 rounded-full text-xs font-bold shadow-sm">
                      <i className="fa-solid fa-coins mr-1"></i>
                      SAVINGS
                    </span>
                  </div>
                </div>
              </div>

              {/* Credit Card */}
              <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/50 dark:hover:border-purple-600/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <i className="fa-solid fa-credit-card text-xl text-purple-600 dark:text-purple-400"></i>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">4.00%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">APR*</div>
                    <div className="font-bold text-gray-900 dark:text-white mb-2 text-sm">CREDIT CARDS</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Credix Vault Bank Credit Card Rates</div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold shadow-sm">
                      <i className="fa-solid fa-credit-card mr-1"></i>
                      CREDIT
                    </span>
                  </div>
                </div>
              </div>

              {/* Loans */}
              <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-200/50 dark:border-gray-700/50 hover:border-orange-300/50 dark:hover:border-orange-600/50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    <i className="fa-solid fa-hand-holding-dollar text-xl text-orange-600 dark:text-orange-400"></i>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent mb-2">15.49%</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-medium">APR*</div>
                    <div className="font-bold text-gray-900 dark:text-white mb-2 text-sm">LOANS</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">Credix Vault Bank Standard Loan Rates</div>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-bold shadow-sm">
                      <i className="fa-solid fa-percentage mr-1"></i>
                      MORTGAGE
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-center mt-8 lg:mt-12">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <i className="fa-solid fa-info-circle text-primary-600 dark:text-primary-400 mr-2"></i>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  *Annual Percentage Yield. Rates subject to change. Terms and conditions apply.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="relative py-16 lg:py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-gray-900 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float-delayed"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-semibold mb-4 border border-white/20">
                <i className="fa-solid fa-concierge-bell mr-2 animate-pulse"></i>
                Our Services
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                How Can We Help You Today?
              </h2>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                Comprehensive banking solutions tailored to your needs
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[
                { icon: "fa-university", title: "Deposit Accounts", desc: "Secure your money with our high-yield savings and checking accounts designed for growth." },
                { icon: "fa-credit-card", title: "Credit Cards", desc: "Find the perfect credit card for your lifestyle and spending habits with competitive rates." },
                { icon: "fa-home", title: "Loans", desc: "Get competitive rates on personal, auto, and home loans tailored to your financial goals." },
                { icon: "fa-briefcase", title: "Business Banking", desc: "Comprehensive banking solutions designed to help your business thrive and grow." },
                { icon: "fa-chart-pie", title: "Wealth & Retire", desc: "Plan for your future with our expert investment and retirement planning services." },
                { icon: "fa-info-circle", title: "About Credix Vault Bank", desc: "Learn more about our commitment to exceptional banking services and community support." },
              ].map((service, idx) => (
                <div key={idx} className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center transition-all duration-500 hover:bg-white/10 hover:-translate-y-2 border border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-white/10">
                  <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg backdrop-blur-sm border border-white/20 group-hover:border-white/30">
                    <i className={`fa-solid ${service.icon} text-2xl text-white group-hover:text-primary-100`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-100 transition-colors">{service.title}</h3>
                  <p className="text-primary-100 leading-relaxed group-hover:text-white/90 transition-colors">{service.desc}</p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Section 1 */}
        <section className="relative py-16 lg:py-20 bg-gradient-to-br from-white via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900/20 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 right-10 w-64 h-64 bg-green-200 dark:bg-green-800 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-primary-200 dark:bg-primary-800 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "500ms" }}></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-green-500/20 to-primary-500/20 rounded-3xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative rounded-3xl aspect-[4/3] overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500 border border-white/20 dark:border-gray-700/50">
                    <Image
                      src="/images/blog-3.png"
                      alt="Happy family with financial security"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2 space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50 text-green-700 dark:text-green-300 rounded-full text-sm font-bold mb-6 shadow-lg backdrop-blur-sm border border-green-200/50 dark:border-green-700/50">
                  <i className="fa-solid fa-dollar-sign mr-2 animate-pulse"></i>
                  Get $200* With a Checking Account Built for You
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-gray-900 dark:from-white dark:via-green-300 dark:to-white bg-clip-text text-transparent leading-tight">
                  Start Building Your Financial Strength
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  For a limited time, get a $200 when you open any new account, and what helps you reach your financial goals. You can open a new account online or in person at any of our locations.
                </p>

                <div className="space-y-3">
                  {["No minimum balance required", "Free online and mobile banking", "24/7 customer support"].map((benefit, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <i className="fa-solid fa-check text-green-600 dark:text-green-400 text-sm"></i>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/signup"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-primary-500/25 hover:-translate-y-1 hover:scale-105 group"
                >
                  <i className="fa-solid fa-arrow-right mr-3 group-hover:translate-x-1 transition-transform"></i>
                  Open Account Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section 2 */}
        <section className="relative py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-primary-50 to-teal-50 dark:from-gray-800 dark:via-primary-900/20 dark:to-teal-900/20 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-20 w-72 h-72 bg-teal-200 dark:bg-teal-800 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-200 dark:bg-primary-800 rounded-full blur-3xl animate-float-delayed"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-100 to-teal-100 dark:from-primary-900/50 dark:to-teal-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-bold mb-4 shadow-lg backdrop-blur-sm border border-primary-200/50 dark:border-primary-700/50">
                  <i className="fa-solid fa-handshake mr-2 animate-pulse"></i>
                  Member-Focused Banking
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-primary-700 to-teal-700 dark:from-white dark:via-primary-300 dark:to-teal-300 bg-clip-text text-transparent leading-tight">
                  Building Strength Together
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Credix Vault Bank is a full-service credit union built on the foundation of providing our members with every step of their financial journey. We're committed to helping our members achieve their financial goals through personalized service and competitive rates.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: "fa-chart-line", color: "primary", title: "Competitive Rates", desc: "Better rates on savings, loans, and credit cards designed to maximize your financial growth." },
                    { icon: "fa-users", color: "teal", title: "Member-Focused", desc: "We're owned by our members, not shareholders. Your success is our priority." },
                    { icon: "fa-heart", color: "purple", title: "Community Committed", desc: "Supporting local communities and causes that matter to our members." },
                  ].map((feature, idx) => (
                    <div key={idx} className="group flex items-start space-x-4 p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:shadow-lg">
                      <div className={`flex-shrink-0 w-10 h-10 bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-200 dark:from-${feature.color}-900/50 dark:to-${feature.color}-800/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <i className={`fa-solid ${feature.icon} text-${feature.color}-600 dark:text-${feature.color}-400`}></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">{feature.title}</h4>
                        <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", alt: "Team collaboration", aspect: "square" },
                  { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", alt: "Professional consultant", aspect: "4/3" },
                  { src: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", alt: "Banking technology", aspect: "4/3", offset: true },
                  { src: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", alt: "Community support", aspect: "square" },
                ].map((img, idx) => (
                  <div key={idx} className={`relative group rounded-2xl ${img.aspect === "square" ? "aspect-square" : "aspect-[4/3]"} ${img.offset ? "pt-8" : ""} overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500`}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-teal-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative rounded-2xl overflow-hidden h-full">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 lg:py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">Hear From Our Customers</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Sarah Morris", role: "Verified Customer", text: "I am impressed with the customer service and speed of payout." },
                { name: "John Davis", role: "Business Owner", text: "Excellent service and competitive rates. Highly recommended!" },
                { name: "Emily Johnson", role: "Personal Banking", text: "The mobile app is fantastic and customer support is top-notch." },
              ].map((testimonial, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fa-solid fa-star text-yellow-400"></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 italic text-sm">"{testimonial.text}"</p>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mr-3">
                      <i className="fa-solid fa-user text-primary-600 dark:text-primary-400"></i>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{testimonial.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 lg:py-16 bg-primary-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-6">
              {[
                { icon: "fa-clock", title: "Banking Hours", content: ["Mon-Fri: 9AM-5PM", "Sat: 9AM-1PM", "Sun: Closed"] },
                { icon: "fa-phone", title: "Phone Banking", content: ["Available 24/7", "Call: 1-800-BANKING", "International: +1-555-0123"] },
                { icon: "fa-envelope", title: "Email Support", content: ["Response within 24hrs", "support@real12.com"] },
                { icon: "fa-map-marker-alt", title: "Visit Us", content: ["123 Banking Street", "Financial District", "New York, NY 10001"] },
              ].map((contact, idx) => (
                <div key={idx} className="text-center lg:text-left">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto lg:mx-0 mb-3">
                    <i className={`fa-solid ${contact.icon} text-lg text-primary-600 dark:text-primary-400`}></i>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{contact.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-xs">
                    {contact.content.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < contact.content.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 dark:from-gray-900 dark:via-primary-900 dark:to-gray-900 text-white py-16 mb-20 lg:mb-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 -right-20 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }}></div>
            <div className="absolute -bottom-20 left-1/3 w-36 h-36 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="lg:col-span-1">
                <div className="group mb-6">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg group-hover:bg-white/30 transition-all duration-300"></div>
                    <Image
                      src="https://credix.deckmaxx.top/storage/app/public/photos/ld5cTft2xx1jZ1PGQFo5qM2UVT85tmHmm2YyddqC.png"
                      alt="Credix Vault Bank"
                      width={120}
                      height={40}
                      className="relative h-10 w-auto"
                    />
                  </div>
                </div>
                <p className="text-primary-100 mb-6 text-sm leading-relaxed">
                  Building financial strength together with personalized banking solutions for every member. Your trusted partner in financial growth.
                </p>

                <div className="flex space-x-3">
                  {[
                    { icon: "fa-facebook-f", hover: "from-blue-500 to-blue-600" },
                    { icon: "fa-twitter", hover: "from-sky-400 to-sky-500" },
                    { icon: "fa-linkedin-in", hover: "from-blue-600 to-blue-700" },
                    { icon: "fa-instagram", hover: "from-pink-500 to-pink-600" },
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className={`group relative w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 hover:from-${social.hover.split(" ")[0]} hover:to-${social.hover.split(" ")[2]} rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 shadow-lg hover:shadow-xl`}
                    >
                      <i className={`fa-brands ${social.icon} text-sm group-hover:scale-110 transition-transform duration-300`}></i>
                    </a>
                  ))}
                </div>
              </div>

              {[
                { title: "Quick Links", color: "primary", links: [
                  { href: "/about", label: "About Us" },
                  { href: "/chart", label: "Services" },
                  { href: "/grants", label: "Grants & Aid" },
                  { href: "/contact", label: "Contact" },
                ]},
                { title: "Services", color: "teal", links: [
                  { href: "/chart", label: "Personal Banking" },
                  { href: "/alerts", label: "Business Banking" },
                  { href: "/send-money", label: "Loans & Credit" },
                  { href: "/dashboard/cards", label: "Cards" },
                ]},
                { title: "Member Services", color: "purple", links: [
                  { href: "/login", label: "Online Banking" },
                  { href: "/apps", label: "Mobile App" },
                  { href: "/contact", label: "ATM Locations" },
                  { href: "/verify", label: "Security Center" },
                ]},
              ].map((section, idx) => (
                <div key={idx}>
                  <h4 className="font-bold mb-6 text-white flex items-center">
                    <div className={`w-1 h-6 bg-gradient-to-b from-${section.color}-400 to-${section.color}-600 rounded-full mr-3`}></div>
                    {section.title}
                  </h4>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          href={link.href}
                          className="group flex items-center text-primary-100 hover:text-white transition-all duration-300 text-sm"
                        >
                          <i className={`fa-solid fa-chevron-right text-xs mr-3 text-${section.color}-400 group-hover:translate-x-1 transition-transform duration-300`}></i>
                          <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t border-primary-700/50 pt-8">
              <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
                  <p className="text-primary-100 text-sm">© 2026 Credix Vault Bank. All rights reserved.</p>
                  <div className="flex items-center space-x-2 text-primary-200 text-xs">
                    <i className="fa-solid fa-shield-alt text-green-400"></i>
                    <span>FDIC Insured</span>
                    <span className="text-primary-400">•</span>
                    <i className="fa-solid fa-lock text-blue-400"></i>
                    <span>256-bit SSL</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-end space-x-6">
                  {[
                    { href: "/privacy", label: "Privacy Policy" },
                    { href: "/terms-of-service", label: "Terms of Service" },
                    { href: "/contact", label: "Accessibility" },
                    { href: "/", label: "Sitemap" },
                  ].map((link, idx) => (
                    <Link
                      key={idx}
                      href={link.href}
                      className="text-primary-100 hover:text-white text-sm transition-colors duration-300 hover:underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}

