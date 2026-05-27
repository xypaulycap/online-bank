"use client";

import Link from "next/link";
import Image from "next/image";
import { CredixNavbar } from "@/components/credix-navbar";

export default function AboutPage() {
  return (
    <div className="font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <CredixNavbar />
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <i className="fa-solid fa-info-circle mr-2"></i>
            About Credix Vault Bank
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Building Financial Strength Together
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
            Credix Vault Bank is a full-service credit union built on the foundation of providing our members with exceptional service at every step of their financial journey.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-6">
                <i className="fa-solid fa-bullseye mr-2"></i>
                Our Mission
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                We Do Banking Differently
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                We believe that people come first, and that everyone deserves a great experience every step of the way. At Credix Vault Bank, we're committed to helping our members achieve their financial goals through personalized service and competitive rates.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                As a member-owned credit union, we're not driven by shareholder profits. Instead, we focus on providing the best possible value and service to our members, ensuring that your success is our priority.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-heart text-primary-600 dark:text-primary-400 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Member-Focused</h3>
                    <p className="text-gray-600 dark:text-gray-300">We're owned by our members, not shareholders. Your success is our priority.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-chart-line text-teal-600 dark:text-teal-400 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Competitive Rates</h3>
                    <p className="text-gray-600 dark:text-gray-300">Better rates on savings, loans, and credit cards designed to maximize your financial growth.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                    <i className="fa-solid fa-users text-purple-600 dark:text-purple-400 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Community Committed</h3>
                    <p className="text-gray-600 dark:text-gray-300">Supporting local communities and causes that matter to our members.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Team collaboration"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-primary-50 to-teal-50 dark:from-gray-800 dark:via-primary-900/20 dark:to-teal-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-100 to-teal-100 dark:from-primary-900/50 dark:to-teal-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
              <i className="fa-solid fa-gem mr-2"></i>
              Our Core Values
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              What Drives Us Every Day
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              These values guide every decision we make and every interaction we have with our members.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "fa-shield-halved", title: "Trust & Integrity", desc: "Building lasting relationships through transparency and honest communication." },
              { icon: "fa-lightbulb", title: "Innovation", desc: "Embracing new technologies to better serve our members." },
              { icon: "fa-handshake", title: "Service Excellence", desc: "Going above and beyond to meet our members' needs." },
              { icon: "fa-globe", title: "Community Impact", desc: "Making a positive difference in the communities we serve." },
            ].map((value, idx) => (
              <div key={idx} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-2xl mb-4 mx-auto">
                  <i className={`fa-solid ${value.icon} text-2xl text-primary-600 dark:text-primary-400`}></i>
                </div>
                <h3 className="text-xl font-bold text-center mb-3 text-gray-900 dark:text-white">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Happy Customers", icon: "fa-users" },
              { number: "$2.5B+", label: "Assets Managed", icon: "fa-dollar-sign" },
              { number: "150+", label: "Years Combined Experience", icon: "fa-calendar" },
              { number: "99.9%", label: "Member Satisfaction", icon: "fa-star" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary-600 dark:bg-primary-700 rounded-full flex items-center justify-center">
                    <i className={`fa-solid ${stat.icon} text-white text-2xl`}></i>
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Join the Credix Vault Bank Family?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Experience banking that puts you first. Open an account today and discover the difference of member-focused banking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-xl hover:-translate-y-1 hover:scale-105"
            >
              <i className="fa-solid fa-user-plus mr-3"></i>
              Open Account Today
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-500/20 backdrop-blur-sm hover:bg-primary-500/30 text-white font-semibold rounded-2xl transition-all duration-300 border border-white/30 hover:border-white/50"
            >
              <i className="fa-solid fa-envelope mr-3"></i>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

