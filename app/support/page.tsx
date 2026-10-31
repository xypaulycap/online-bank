"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { userService, inquiryService, Inquiry } from "@/lib/supabase-services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  HelpCircle,
  Mail,
  Phone,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Headphones,
  ShieldAlert,
} from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "How long does an international wire transfer take?",
    a: "International wire transfers typically take 1 to 3 business days to clear depending on correspondent banks, intermediate clearing systems, and time zone cutoffs.",
  },
  {
    q: "How can I update my account password or security settings?",
    a: "Go to your Profile page from the dashboard navigation menu, switch to the 'Security & Password' tab, enter your current password followed by your new password, and click 'Update Password'.",
  },
  {
    q: "What should I do if my debit card is lost or stolen?",
    a: "Navigate to the 'Cards' section in your dashboard to immediately freeze your card. You can also contact our 24/7 emergency fraud line or submit an urgent support ticket below.",
  },
  {
    q: "Why is my transfer or deposit pending?",
    a: "Transfers and deposits may require automated compliance checks or admin approval. You can check the Pending Transactions tab for real-time progress.",
  },
  {
    q: "How do I complete KYC (Identity) verification?",
    a: "Visit the 'KYC Verification' section on your dashboard sidebar, upload your government-issued ID card (front and back), and confirm your residential details.",
  },
];

export default function SupportPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const loadUserDataAndInquiries = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const user = await userService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
        setName(fullName || user.username || "");
        setEmail(user.email || session.user.email || "");

        // Fetch phone number from profile if available
        try {
          const { data: prof } = await supabase
            .from("user_profiles")
            .select("phone_number")
            .eq("id", session.user.id)
            .maybeSingle();
          if (prof?.phone_number) setPhone(prof.phone_number);
        } catch {
          // ignore if profile query fails
        }
      } else {
        setEmail(session.user.email || "");
      }

      // Fetch user's previous inquiries
      try {
        const userInquiries = await inquiryService.getUserInquiries(session.user.id);
        setInquiries(userInquiries);
      } catch (err) {
        console.warn("Failed to load user inquiries:", err);
      }
    } catch (error) {
      console.error("Error loading support data:", error);
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  useEffect(() => {
    loadUserDataAndInquiries();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter your name" });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a valid email address" });
      return;
    }
    if (!subject.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a subject" });
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a detailed message (at least 10 characters)",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await inquiryService.createInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        category,
        priority,
        subject: subject.trim(),
        message: message.trim(),
      });

      toast({
        title: "Inquiry Submitted Successfully",
        description: "Our support team has received your ticket and will respond promptly.",
      });

      // Clear form inputs
      setSubject("");
      setMessage("");
      setPriority("normal");
      setCategory("general");

      // Refresh inquiries list
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const refreshed = await inquiryService.getUserInquiries(session.user.id);
        setInquiries(refreshed);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Failed to submit inquiry. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-300">Pending</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-300">In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-300">Resolved</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-300">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-3">
            <Headphones className="h-3.5 w-3.5" />
            24/7 Dedicated Support
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Help & Support Center</h1>
          <p className="mt-2 text-emerald-100 text-sm sm:text-base leading-relaxed">
            Have questions about your accounts, wire transfers, cards, or security?
            Submit an inquiry below or reach our concierge team directly.
          </p>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow border-emerald-100 dark:border-emerald-950">
          <CardContent className="pt-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Phone Banking</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Available 24/7 worldwide</p>
              <div className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 space-y-0.5">
                <div>+1 (656) 587-7247</div>
                <div>+44 7882 752978</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-teal-100 dark:border-teal-950">
          <CardContent className="pt-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center flex-shrink-0 text-teal-600 dark:text-teal-400">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Direct Email</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Response within 24 hours</p>
              <div className="mt-2 text-sm font-medium text-teal-700 dark:text-teal-400 space-y-0.5">
                <a href="mailto:info@valtierfingroup.com" className="hover:underline block">
                  info@valtierfingroup.com
                </a>
                <a href="mailto:support@atlanticgates.live" className="hover:underline block text-xs">
                  support@atlanticgates.live
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-cyan-100 dark:border-cyan-950">
          <CardContent className="pt-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center flex-shrink-0 text-cyan-600 dark:text-cyan-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Ticket Response Time</h3>
              <p className="text-xs text-muted-foreground mt-0.5">In-app notifications</p>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Tickets submitted below trigger automated admin alerts. Urgent matters are prioritized within 2 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Support Request Form */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <CardTitle>Submit an Inquiry or Request</CardTitle>
              </div>
              <CardDescription>
                Fill out the form below. Our support administrators will review your inquiry and update you directly in your dashboard and via email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Your Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Phone (Optional)</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="account">Account & Balance</SelectItem>
                        <SelectItem value="transfers">Transfers & Wire</SelectItem>
                        <SelectItem value="cards">Debit / Virtual Cards</SelectItem>
                        <SelectItem value="kyc">KYC & Verification</SelectItem>
                        <SelectItem value="security">Security & Access</SelectItem>
                        <SelectItem value="deposit">Deposit Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={priority} onValueChange={(val: "normal" | "urgent") => setPriority(val)}>
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
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue or request"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Message / Details</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please describe your question or issue in detail. Include any relevant account numbers or reference IDs..."
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5"
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Inquiry
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* My Inquiries & FAQs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Past Inquiries Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">My Submitted Inquiries</CardTitle>
                <Badge variant="secondary">{inquiries.length}</Badge>
              </div>
              <CardDescription className="text-xs">
                Track status and replies from administration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingInquiries ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading inquiry history...</div>
              ) : inquiries.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  No inquiries submitted yet.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium text-foreground truncate">{inq.subject}</div>
                        {getStatusBadge(inq.status)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {inq.message}
                      </div>
                      {inq.admin_notes && (
                        <div className="mt-2 p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                          <strong>Admin Response:</strong> {inq.admin_notes}
                        </div>
                      )}
                      <div className="mt-2 text-[11px] text-muted-foreground flex justify-between">
                        <span className="capitalize">{inq.category}</span>
                        <span>{new Date(inq.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* FAQs Accordion */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {FAQ_ITEMS.map((faq, index) => {
                const isExpanded = expandedFaq === index;
                return (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isExpanded ? null : index)}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-muted/40 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 flex-shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="px-3.5 pb-3 pt-1 text-xs text-muted-foreground leading-relaxed border-t bg-muted/20">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
