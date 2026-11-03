"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  ArrowRight, 
  Clock, 
  Copy, 
  Check, 
  Pause, 
  Play, 
  FileText,
  Building,
  User,
  Wallet
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { BankLogo } from "@/components/bank-logo";

interface TransactionDetails {
  id: number;
  amount: number;
  transaction_type: string;
  status: string;
  description?: string;
  timestamp: string;
  account?: {
    account_number: string;
    account_type?: { name: string };
  };
  recipient_account?: {
    account_number: string;
    user_id?: string;
  };
  recipientName?: string;
  bankName?: string;
  recipientAccountDisplay?: string;
}

function TransferSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const txIdParam = searchParams.get("txId");




  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Fetch transaction details
  useEffect(() => {
    async function loadTransaction() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        // Get user currency preference
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("currency, first_name, last_name")
          .eq("id", session.user.id)
          .single();

        if (profile?.currency) {
          setCurrency(profile.currency);
        }

        let query = supabase
          .from("transactions")
          .select(`
            id,
            amount,
            transaction_type,
            status,
            description,
            timestamp,
            account:accounts!transactions_account_id_fkey(
              account_number,
              account_type:account_types(name),
              user_id
            ),
            recipient_account:accounts!transactions_recipient_account_id_fkey(
              account_number,
              user_id
            )
          `);

        if (txIdParam) {
          query = query.eq("id", parseInt(txIdParam));
        } else {
          // Fallback: get the user's latest transaction
          const { data: userAccounts } = await supabase
            .from("accounts")
            .select("id")
            .eq("user_id", session.user.id);

          const accIds = userAccounts?.map((a) => a.id) || [];
          if (accIds.length > 0) {
            query = query.in("account_id", accIds).order("timestamp", { ascending: false }).limit(1);
          }
        }

        const { data, error } = await query.single();

        if (error || !data) {
          console.warn("Could not load transaction details:", error);
          setIsLoading(false);
          return;
        }

        // Parse description if it has structured metadata
        const desc = data.description || "";
        const detailsMap: Record<string, string> = {};
        const lines = desc.split("\n");
        let note = "";

        for (const line of lines) {
          const colonIdx = line.indexOf(":");
          if (colonIdx > 0) {
            const k = line.substring(0, colonIdx).trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
            const v = line.substring(colonIdx + 1).trim();
            if (k && v) detailsMap[k] = v;
          } else if (!note && line.trim()) {
            note = line.trim();
          }
        }

        let recipientName = detailsMap["recipient_name"] || "";
        if (!recipientName && data.recipient_account?.user_id) {
          const { data: recProfile } = await supabase
            .from("user_profiles")
            .select("first_name, last_name")
            .eq("id", data.recipient_account.user_id)
            .single();

          if (recProfile) {
            recipientName = `${recProfile.first_name || ""} ${recProfile.last_name || ""}`.trim();
          }
        }

        const recipientAccountDisplay = 
          detailsMap["recipient_account"] || 
          detailsMap["swiss_iban"] || 
          detailsMap["account_number"] || 
          data.recipient_account?.account_number || 
          "External Account";

        const bankName = detailsMap["bank_name"] || (data.transaction_type === "transfer" ? "Valtier Financial Group" : "External Institution");

        setTransaction({
          id: data.id,
          amount: parseFloat(data.amount),
          transaction_type: data.transaction_type,
          status: data.status,
          description: note || desc,
          timestamp: data.timestamp,
          account: Array.isArray(data.account) ? data.account[0] : data.account,
          recipient_account: Array.isArray(data.recipient_account) ? data.recipient_account[0] : data.recipient_account,
          recipientName: recipientName || "Beneficiary",
          bankName,
          recipientAccountDisplay,
        });
      } catch (err) {
        console.error("Error loading transfer success data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTransaction();
  }, [txIdParam, router]);

  // Countdown timer
  useEffect(() => {
    if (isTimerPaused) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused, router]);

  // Download PDF Receipt
  const handleDownloadReceipt = async () => {
    if (!transaction) {
      toast.error("Transaction details not available yet.");
      return;
    }

    setIsDownloading(true);
    // Pause auto-redirect so the user is not interrupted
    setIsTimerPaused(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication expired. Please log in again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/receipt?transactionId=${transaction.id}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to generate receipt PDF");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Transaction_Receipt_TXN_${transaction.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);

      toast.success("Transaction receipt downloaded successfully!");
    } catch (err: any) {
      console.error("Receipt download error:", err);
      toast.error(err.message || "Could not download receipt. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyRef = () => {
    if (!transaction) return;
    const refCode = `VFG-TXN-${transaction.id.toString().padStart(6, "0")}`;
    navigator.clipboard.writeText(refCode);
    setCopiedRef(true);
    toast.success("Transaction reference copied!");
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handlePrint = () => {
    setIsTimerPaused(true);
    window.print();
  };

  const getTransferTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      transfer: "Internal Transfer",
      local_transfer: "Local Transfer (Swiss / SEPA)",
      international_transfer: "International Wire",
      wire_transfer: "Wire Transfer",
      deposit: "Deposit",
      withdrawal: "Withdrawal",
    };
    return map[type] || type.replace("_", " ").toUpperCase();
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-xl">
      <Card className="border-blue-200 dark:border-blue-900/50 shadow-xl overflow-hidden print:shadow-none print:border-none">
        {/* Top Header with Status */}
        <div className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/30 dark:to-background p-6 pb-4 text-center border-b border-blue-100 dark:border-blue-900/30">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center animate-pulse">
                <Clock className="h-9 w-9 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 text-white shadow-sm">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-800 dark:text-blue-300">
            Transfer Being Processed
          </CardTitle>
          <CardDescription className="text-sm mt-1.5 text-muted-foreground max-w-sm mx-auto">
            Your transaction instruction has been received and is currently being processed by our system.
          </CardDescription>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Amount Display */}
          <div className="text-center py-3 bg-muted/40 rounded-xl border border-border/60">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Amount
            </span>
            <div className="text-3xl font-extrabold text-foreground mt-0.5 tracking-tight">
              {transaction ? formatCurrency(transaction.amount, currency) : "Processing..."}
            </div>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
              Status: Processing
            </div>
          </div>

          {/* Receipt Summary Grid */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Reference Number
              </span>
              <div className="flex items-center gap-2 font-mono font-medium text-foreground">
                <span>
                  {transaction ? `VFG-TXN-${transaction.id.toString().padStart(6, "0")}` : "---"}
                </span>
                {transaction && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={handleCopyRef}
                    title="Copy Reference"
                  >
                    {copiedRef ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Date & Time
              </span>
              <span className="font-medium text-foreground text-right">
                {transaction
                  ? new Date(transaction.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Just now"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5" />
                Transfer Type
              </span>
              <span className="font-medium text-foreground">
                {transaction ? getTransferTypeLabel(transaction.transaction_type) : "Transfer"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Source Account
              </span>
              <span className="font-medium text-foreground">
                {transaction?.account
                  ? `${transaction.account.account_type?.name || "Account"} (**** ${transaction.account.account_number.slice(-4)})`
                  : "Checking Account"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                Beneficiary / Recipient
              </span>
              <div className="text-right">
                <div className="font-medium text-foreground">
                  {transaction?.recipientName || "Authorized Beneficiary"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {transaction?.recipientAccountDisplay || "Account Verified"}
                </div>
              </div>
            </div>

            {transaction?.bankName && (
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Receiving Bank</span>
                <span className="font-medium text-foreground text-right">
                  {transaction.bankName}
                </span>
              </div>
            )}

            {transaction?.description && (
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Description / Note</span>
                <span className="font-medium text-foreground text-right max-w-[240px] truncate">
                  {transaction.description}
                </span>
              </div>
            )}
          </div>

          {/* Download & Print Receipt Buttons */}
          <div className="pt-2 space-y-2.5 print:hidden">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 flex items-center justify-center gap-2 shadow-sm"
              onClick={handleDownloadReceipt}
              disabled={isDownloading || !transaction}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? "Generating PDF Receipt..." : "Download Transaction Receipt (PDF)"}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-1.5"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 text-muted-foreground" />
                Print Receipt
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-1.5"
                onClick={() => router.push("/transfers")}
              >
                New Transfer
              </Button>
            </div>
          </div>

          {/* Countdown timer & dashboard return */}
          <div className="pt-2 border-t border-border/60 text-center space-y-3 print:hidden">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span>
                {isTimerPaused
                  ? "Auto-redirect paused"
                  : `Redirecting to dashboard in ${countdown}s`}
              </span>
              <button
                type="button"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
              >
                {isTimerPaused ? (
                  <>
                    <Play className="h-3 w-3" /> Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-3 w-3" /> Stay here
                  </>
                )}
              </button>
            </div>

            <Button
              variant="default"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard Now
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TransferSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-20 max-w-md text-center text-muted-foreground">
          Loading receipt details...
        </div>
      }
    >
      <TransferSuccessContent />
    </Suspense>
  );
}
