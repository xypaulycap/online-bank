"use client";

import Link from "next/link";
import Image from "next/image";
import { CredixNavbar } from "@/components/credix-navbar";

export default function ServicesPage() {
  const services = [
    {
      title: "Personal Banking",
      icon: "fa-user",
      description: "Comprehensive banking solutions designed for individuals and families. From checking and savings accounts to personal loans, we have everything you need to manage your finances.",
      href: "/chart",
      color: "primary",
      features: [
        "High-yield savings accounts",
        "Free checking accounts",
        "Mobile banking app",
        "24/7 customer support",
        "Personal loans",
        "Auto loans",
      ],
    },
    {
      title: "Business Banking",
      icon: "fa-briefcase",
      description: "Tailored financial solutions to help your business grow and succeed. We offer business accounts, commercial loans, and specialized services for entrepreneurs.",
      href: "/alerts",
      color: "blue",
      features: [
        "Business checking accounts",
        "Merchant services",
        "Commercial loans",
        "Business credit cards",
        "Cash management",
        "Online business banking",
      ],
    },
    {
      title: "Loans & Credit",
      icon: "fa-handshake",
      description: "Flexible lending options with competitive rates. Whether you're buying a home, a car, or need a personal loan, we have the right solution for you.",
      href: "/send-money",
      color: "green",
      features: [
        "Mortgage loans",
        "Home equity loans",
        "Auto loans",
        "Personal loans",
        "Student loans",
        "Credit lines",
      ],
    },
    {
      title: "Credit Cards",
      icon: "fa-credit-card",
      description: "Choose from our range of credit cards designed to match your lifestyle. Earn rewards, build credit, and enjoy exclusive benefits.",
      href: "/dashboard/cards",
      color: "purple",
      features: [
        "Cashback rewards",
        "Travel rewards",
        "Low interest rates",
        "No annual fees",
        "Credit building",
        "Contactless payments",
      ],
    },
    {
      title: "Grants & Aid",
      icon: "fa-hand-holding-dollar",
      description: "Financial assistance programs to help members in need. We offer grants, scholarships, and aid programs to support our community.",
      href: "/grants",
      color: "orange",
      features: [
        "Educational grants",
        "Emergency assistance",
        "Community grants",
        "Scholarship programs",
        "Financial counseling",
        "Resource connections",
      ],
    },
    {
      title: "Wealth Management",
      icon: "fa-chart-pie",
      description: "Expert investment and retirement planning services to help you secure your financial future. Work with our advisors to build long-term wealth.",
      href: "/contact",
      color: "teal",
      features: [
        "Investment planning",
        "Retirement accounts",
        "IRA options",
        "Financial planning",
        "Estate planning",
        "Tax strategies",
      ],
    },
  ];

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
            <i className="fa-solid fa-concierge-bell mr-2"></i>
            Our Services
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            How Can We Help You Today?
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
            Comprehensive banking solutions tailored to your needs. From personal banking to business solutions, we have the tools and expertise to help you achieve your financial goals.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300/50 dark:hover:border-primary-600/50 overflow-hidden"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  service.color === 'primary' ? 'bg-gradient-to-br from-primary-500/10 via-transparent to-primary-500/10' :
                  service.color === 'blue' ? 'bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/10' :
                  service.color === 'green' ? 'bg-gradient-to-br from-green-500/10 via-transparent to-green-500/10' :
                  service.color === 'purple' ? 'bg-gradient-to-br from-purple-500/10 via-transparent to-purple-500/10' :
                  service.color === 'orange' ? 'bg-gradient-to-br from-orange-500/10 via-transparent to-orange-500/10' :
                  'bg-gradient-to-br from-teal-500/10 via-transparent to-teal-500/10'
                }`}></div>
                <div className="relative z-10">
                  <div className={`flex items-center justify-center w-20 h-20 rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg ${
                    service.color === 'primary' ? 'bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50' :
                    service.color === 'blue' ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50' :
                    service.color === 'green' ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/50 dark:to-green-800/50' :
                    service.color === 'purple' ? 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50' :
                    service.color === 'orange' ? 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50' :
                    'bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/50 dark:to-teal-800/50'
                  }`}>
                    <i className={`fa-solid ${service.icon} text-2xl ${
                      service.color === 'primary' ? 'text-primary-600 dark:text-primary-400' :
                      service.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      service.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      service.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      service.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                      'text-teal-600 dark:text-teal-400'
                    }`}></i>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Key Features:</h4>
                    <ul className="space-y-2">
                      {service.features.slice(0, 4).map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <i className={`fa-solid fa-check mr-2 ${
                            service.color === 'primary' ? 'text-primary-500' :
                            service.color === 'blue' ? 'text-blue-500' :
                            service.color === 'green' ? 'text-green-500' :
                            service.color === 'purple' ? 'text-purple-500' :
                            service.color === 'orange' ? 'text-orange-500' :
                            'text-teal-500'
                          }`}></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={service.href}
                    className={`inline-flex items-center px-6 py-3 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group ${
                      service.color === 'primary' ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800' :
                      service.color === 'blue' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' :
                      service.color === 'green' ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' :
                      service.color === 'purple' ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' :
                      service.color === 'orange' ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800' :
                      'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800'
                    }`}
                  >
                    Learn More
                    <i className="fa-solid fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-primary-50 to-teal-50 dark:from-gray-800 dark:via-primary-900/20 dark:to-teal-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-100 to-teal-100 dark:from-primary-900/50 dark:to-teal-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
              <i className="fa-solid fa-star mr-2"></i>
              Why Choose Credix Vault Bank
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Banking Made Simple, Secure, and Personal
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We combine cutting-edge technology with personalized service to deliver an exceptional banking experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "fa-shield-halved",
                title: "Secure & Protected",
                desc: "Your money and personal information are protected with industry-leading security measures and FDIC insurance.",
              },
              {
                icon: "fa-mobile-alt",
                title: "Bank Anytime, Anywhere",
                desc: "Access your accounts 24/7 through our mobile app and online banking platform. Bank on your schedule.",
              },
              {
                icon: "fa-headset",
                title: "Expert Support",
                desc: "Our friendly and knowledgeable team is always ready to help you with your banking needs, whenever you need us.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-6 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-full flex items-center justify-center">
                    <i className={`fa-solid ${feature.icon} text-2xl text-primary-600 dark:text-primary-400`}></i>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-800 dark:to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied members who trust Credix Vault Bank for their banking needs. Open an account today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-xl hover:-translate-y-1 hover:scale-105"
            >
              <i className="fa-solid fa-user-plus mr-3"></i>
              Open Account
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary-500/20 backdrop-blur-sm hover:bg-primary-500/30 text-white font-semibold rounded-2xl transition-all duration-300 border border-white/30 hover:border-white/50"
            >
              <i className="fa-solid fa-phone mr-3"></i>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

