"use client";

import { useState } from "react";
import Link from "next/link";
import { CredixNavbar } from "@/components/credix-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Clock,
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "general",
    priority: "normal",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter your name" });
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a valid email address" });
      return;
    }
    if (!formData.subject.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a subject" });
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a detailed message (at least 10 characters)",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          category: formData.category,
          priority: formData.priority,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit inquiry");
      }

      setIsSubmitted(true);
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for reaching out. Our support team will get back to you shortly.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        category: "general",
        priority: "normal",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <CredixNavbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <Mail className="h-4 w-4 mr-2" />
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
            We're Here to Help
          </h1>
          <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Have a question about our private banking services or need personal assistance? Contact our team anytime.
          </p>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Contact Information */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
                  Contact Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Reach out through any of our channels below. Our concierge team is available around the clock to support your financial operations.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Banking Hours</h3>
                    <div className="text-gray-600 dark:text-gray-300 text-sm mt-1 space-y-0.5">
                      <div>Monday – Friday: 9:00 AM – 5:00 PM EST</div>
                      <div>Saturday: 9:00 AM – 1:00 PM EST</div>
                      <div>Sunday: Closed (Digital Banking Active 24/7)</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Phone Support</h3>
                    <div className="text-gray-600 dark:text-gray-300 text-sm mt-1 space-y-0.5">
                      <div>North America: <a href="tel:+16565877247" className="text-emerald-600 hover:underline font-medium">+1 (656) 587-7247</a></div>
                      <div>Europe / UK: <a href="tel:+447882752978" className="text-emerald-600 hover:underline font-medium">+44 7882 752978</a></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Email Inquiries</h3>
                    <div className="text-gray-600 dark:text-gray-300 text-sm mt-1 space-y-0.5">
                      <div>General: <a href="mailto:info@valtierfingroup.com" className="text-emerald-600 hover:underline font-medium">info@valtierfingroup.com</a></div>
                      <div>Support: <a href="mailto:support@atlanticgates.live" className="text-emerald-600 hover:underline font-medium">support@atlanticgates.live</a></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Connect With Us</h4>
                <div className="flex space-x-3">
                  {[
                    { icon: "fa-facebook-f", href: "#" },
                    { icon: "fa-twitter", href: "#" },
                    { icon: "fa-linkedin-in", href: "#" },
                    { icon: "fa-instagram", href: "#" },
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href={social.href}
                      className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300"
                    >
                      <i className={`fa-brands ${social.icon} text-sm`}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Inquiry Form */}
            <div className="lg:col-span-7 bg-white dark:bg-gray-800/90 rounded-3xl p-8 sm:p-10 shadow-xl border border-gray-100 dark:border-gray-700/60">
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Direct Inquiry
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Send Us a Message</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Submit your request below. A senior representative will review and respond directly.
                </p>
              </div>

              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Message Received!</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto">
                    Thank you for contacting us. Your ticket has been logged and our team will get back to you shortly.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="mt-4"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                        Phone Number
                      </label>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                        Category
                      </label>
                      <Select
                        value={formData.category}
                        onValueChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="account">Account Opening</SelectItem>
                          <SelectItem value="wire">Wire & Transfers</SelectItem>
                          <SelectItem value="cards">Debit / Credit Cards</SelectItem>
                          <SelectItem value="corporate">Corporate Banking</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                        Priority
                      </label>
                      <Select
                        value={formData.priority}
                        onValueChange={(val) => setFormData((prev) => ({ ...prev, priority: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief topic of your inquiry"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide details about your inquiry..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-emerald-600/20"
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
