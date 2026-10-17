"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cryptoWalletService, accountService, depositRequestService, publicSettingsService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { Copy, Check, Wallet, AlertCircle, Send, User, Landmark, Hash, Share2, Building, FileText, BadgeCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CryptoWallet {
  id: number;
  name: string;
  symbol: string;
  wallet_address: string;
  logo_url: string | null;
  network: string | null;
  display_order: number;
}

interface Account {
  id: number;
  account_type: { name: string };
  account_number: string;
  balance: string;
}

export default function DepositPage() {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [adminBankDetails, setAdminBankDetails] = useState({
    bank_name: "SWISS PRIVATE BANK",
    account_holder: "Loading...",
    account_number: "Loading...",
    iban: "Loading...",
    swift_bic: "Loading...",
    currency: "CHF / USD",
    client_number: "Loading...",
    bank_address: "Zurich, Switzerland",
    account_type: "Private Current Account",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);
  const [submitForm, setSubmitForm] = useState({
    account_id: "",
    crypto_wallet_id: "",
    amount: "",
    transaction_hash: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Fetch wallets and accounts separately to handle errors better
      let walletsData: any[] = [];
      let accountsData: any[] = [];

      try {
        walletsData = await cryptoWalletService.getActiveCryptoWallets();
        setWallets(walletsData as CryptoWallet[]);
      } catch (walletErr: any) {
        console.error("Error fetching wallets:", walletErr);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load crypto wallets: ${walletErr.message}`,
        });
      }

      try {
        // Fetch user profile first for user-specific bank details and name
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, currency, admin_bank_details')
          .eq('id', session.user.id)
          .single();
          
        let details = profile?.admin_bank_details;
        
        // Check if details has custom configuration, fallback if needed
        if (!details || (!details.account_number && !details.iban && !details.bank_name)) {
          details = await publicSettingsService.getSetting('bank_details');
        }

        const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
        const clientNo = `C-${(profile?.id || session.user.id || "").replace(/-/g, "").slice(0, 6).toUpperCase()}`;

        if (details) {
          setAdminBankDetails({
            bank_name: details.bank_name || "SWISS PRIVATE BANK",
            account_holder: details.account_holder || (details.account_name && details.account_name !== "USER" && details.account_name !== "Loading..." ? details.account_name : fullName) || "Valtier Client",
            account_number: details.account_number || "4587-XXXX-XX",
            iban: details.iban || "CHXX XXXX XXXX XXXX XXXX X",
            swift_bic: details.swift_bic || (details.routing_number && details.routing_number !== "NA" ? details.routing_number : "XXXXXXXX"),
            currency: details.currency || (profile?.currency ? `${profile.currency} / CHF` : "CHF / USD"),
            client_number: details.client_number || clientNo,
            bank_address: details.bank_address || "Zurich, Switzerland",
            account_type: details.account_type || "Private Current Account",
          });
        } else {
          setAdminBankDetails({
            bank_name: "SWISS PRIVATE BANK",
            account_holder: fullName || "Valtier Client",
            account_number: "4587-XXXX-XX",
            iban: "CHXX XXXX XXXX XXXX XXXX X",
            swift_bic: "XXXXXXXX",
            currency: profile?.currency ? `${profile.currency} / CHF` : "CHF / USD",
            client_number: clientNo,
            bank_address: "Zurich, Switzerland",
            account_type: "Private Current Account",
          });
        }
      } catch (settingsErr) {
        console.error("Error fetching admin bank details:", settingsErr);
      }

      try {
        accountsData = await accountService.getAccounts();
        console.log("Raw accounts data:", accountsData);
        
        // Map accounts properly - handle both string and number balance
        const mappedAccounts = (accountsData || []).map((acc: any) => ({
          id: acc.id,
          account_type: acc.account_type || { name: "Account" },
          account_number: acc.account_number,
          balance: typeof acc.balance === 'string' ? acc.balance : (acc.balance || 0).toString(),
        }));
        
        setAccounts(mappedAccounts);
        
        // Debug: log if accounts are empty
        if (mappedAccounts.length === 0) {
          console.warn("No accounts found for user");
        } else {
          console.log("Accounts loaded:", mappedAccounts.length, mappedAccounts);
        }
      } catch (accountErr: any) {
        console.error("Error fetching accounts:", accountErr);
        setAccounts([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to load accounts: ${accountErr.message}`,
        });
      }
    } catch (err: any) {
      console.error("Error fetching wallets/accounts:", err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async (address: string, walletId: number) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(walletId);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy address",
      });
    }
  };

  const handleOpenSubmitDialog = (walletId: number) => {
    setSelectedWalletId(walletId);
    const wallet = wallets.find(w => w.id === walletId);
    setSubmitForm({
      account_id: "",
      crypto_wallet_id: walletId.toString(),
      amount: "",
      transaction_hash: "",
    });
    setIsSubmitDialogOpen(true);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitForm.account_id || !submitForm.crypto_wallet_id || !submitForm.amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    const amountNum = parseFloat(submitForm.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedWallet = wallets.find(w => w.id === parseInt(submitForm.crypto_wallet_id));
      await depositRequestService.createDepositRequest({
        account_id: parseInt(submitForm.account_id),
        crypto_wallet_id: parseInt(submitForm.crypto_wallet_id),
        amount: amountNum,
        crypto_symbol: selectedWallet?.symbol || "",
        transaction_hash: submitForm.transaction_hash || undefined,
      });

      toast({
        title: "Success",
        description: "Deposit request submitted successfully. It will be reviewed by admin.",
      });

      setIsSubmitDialogOpen(false);
      setSubmitForm({
        account_id: "",
        crypto_wallet_id: "",
        amount: "",
        transaction_hash: "",
      });
      setSelectedWalletId(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-lg">Loading deposit options...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl space-y-6">
      {/* Admin Bank Details Card */}
      <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-gray-800">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-start justify-between pb-5 border-b border-gray-100 dark:border-gray-700/80">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00b47d]">
                Official Client Account Details
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white mt-0.5 tracking-tight uppercase">
                {adminBankDetails.bank_name} — CLIENT ACCOUNT DETAILS
              </h2>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-[#e6f7f2] dark:bg-[#00b47d]/20 flex items-center justify-center text-[#00b47d] shrink-0">
              <Landmark className="h-6 w-6" />
            </div>
          </div>

          <div className="divide-y divide-dashed divide-gray-200 dark:divide-gray-700 my-2">
            {/* Account Holder */}
            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Account Holder</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{adminBankDetails.account_holder}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-gray-400 hover:text-[#00b47d] hover:bg-[#e6f7f2] dark:hover:bg-[#00b47d]/20 rounded-lg"
                onClick={() => handleCopyAddress(adminBankDetails.account_holder, 101)}
                title="Copy Account Holder"
              >
                {copiedId === 101 ? <Check className="h-4 w-4 text-[#00b47d]" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Account No. */}
            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 shrink-0">
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Account No.</p>
                  <p className="text-base sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">{adminBankDetails.account_number}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-gray-400 hover:text-[#00b47d] hover:bg-[#e6f7f2] dark:hover:bg-[#00b47d]/20 rounded-lg"
                onClick={() => handleCopyAddress(adminBankDetails.account_number, 102)}
                title="Copy Account Number"
              >
                {copiedId === 102 ? <Check className="h-4 w-4 text-[#00b47d]" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* IBAN */}
            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#e6f7f2] dark:bg-[#00b47d]/20 flex items-center justify-center text-[#00b47d] font-bold text-xs shrink-0">
                  IBAN
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">IBAN</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white font-mono break-all">{adminBankDetails.iban}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-gray-400 hover:text-[#00b47d] hover:bg-[#e6f7f2] dark:hover:bg-[#00b47d]/20 rounded-lg"
                onClick={() => handleCopyAddress(adminBankDetails.iban, 103)}
                title="Copy IBAN"
              >
                {copiedId === 103 ? <Check className="h-4 w-4 text-[#00b47d]" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* SWIFT / BIC */}
            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#e6f7f2] dark:bg-[#00b47d]/20 flex items-center justify-center text-[#00b47d] shrink-0">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">SWIFT / BIC</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white font-mono">{adminBankDetails.swift_bic}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-gray-400 hover:text-[#00b47d] hover:bg-[#e6f7f2] dark:hover:bg-[#00b47d]/20 rounded-lg"
                onClick={() => handleCopyAddress(adminBankDetails.swift_bic, 104)}
                title="Copy SWIFT/BIC"
              >
                {copiedId === 104 ? <Check className="h-4 w-4 text-[#00b47d]" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Currency */}
            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold text-xs shrink-0">
                  CHF
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Currency</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{adminBankDetails.currency}</p>
                </div>
              </div>
            </div>

            {/* Client No. */}
            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Client No.</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white font-mono">{adminBankDetails.client_number}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-gray-400 hover:text-[#00b47d] hover:bg-[#e6f7f2] dark:hover:bg-[#00b47d]/20 rounded-lg"
                onClick={() => handleCopyAddress(adminBankDetails.client_number, 105)}
                title="Copy Client Number"
              >
                {copiedId === 105 ? <Check className="h-4 w-4 text-[#00b47d]" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {/* Bank Address */}
            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Bank Address</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{adminBankDetails.bank_address}</p>
                </div>
              </div>
            </div>

            {/* Account Type */}
            <div className="py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 shrink-0">
                  <BadgeCheck className="h-5 w-5 text-[#00b47d]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Account Type</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{adminBankDetails.account_type}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/80">
            <Button 
              variant="secondary" 
              className="flex-1 bg-[#e6f7f2] text-[#00b47d] hover:bg-[#d1f0e6] dark:bg-[#00b47d]/10 dark:text-[#00b47d] dark:hover:bg-[#00b47d]/20 rounded-full h-12 sm:h-14 font-semibold text-sm sm:text-base border-0 shadow-none"
              onClick={() => {
                const fullText = `${adminBankDetails.bank_name} — CLIENT ACCOUNT DETAILS\nAccount Holder: ${adminBankDetails.account_holder}\nAccount No.: ${adminBankDetails.account_number}\nIBAN: ${adminBankDetails.iban}\nSWIFT/BIC: ${adminBankDetails.swift_bic}\nCurrency: ${adminBankDetails.currency}\nClient No.: ${adminBankDetails.client_number}\nBank Address: ${adminBankDetails.bank_address}\nAccount Type: ${adminBankDetails.account_type}`;
                handleCopyAddress(fullText, -1);
              }}
            >
              {copiedId === -1 ? "All Details Copied!" : "Copy Details"}
            </Button>
            <Button 
              className="flex-1 bg-[#00c288] hover:bg-[#00a876] text-white rounded-full h-12 sm:h-14 font-semibold text-sm sm:text-base border-0 shadow-none"
              onClick={() => {
                const fullText = `${adminBankDetails.bank_name} — CLIENT ACCOUNT DETAILS\nAccount Holder: ${adminBankDetails.account_holder}\nAccount No.: ${adminBankDetails.account_number}\nIBAN: ${adminBankDetails.iban}\nSWIFT/BIC: ${adminBankDetails.swift_bic}\nCurrency: ${adminBankDetails.currency}\nClient No.: ${adminBankDetails.client_number}\nBank Address: ${adminBankDetails.bank_address}\nAccount Type: ${adminBankDetails.account_type}`;
                if (navigator.share) {
                  navigator.share({
                    title: `${adminBankDetails.bank_name} Client Account Details`,
                    text: fullText,
                  });
                } else {
                  handleCopyAddress(fullText, -2);
                }
              }}
            >
              {copiedId === -2 ? "Details Copied!" : "Share Details"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="border-0 shadow-md rounded-3xl bg-white dark:bg-gray-800">
        <CardContent className="p-6 sm:p-8">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-base sm:text-lg">Add money via bank transfer in just 3 steps</h3>
          <ol className="space-y-5 text-sm sm:text-base text-gray-600 dark:text-gray-300">
            <li className="flex gap-3">
              <span className="font-bold text-[#00b47d]">1.</span>
              <span className="leading-relaxed">Copy the account details above—Account No. {adminBankDetails.account_number} or IBAN {adminBankDetails.iban}</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#00b47d]">2.</span>
              <span className="leading-relaxed">Open the bank app you want to transfer money from</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-[#00b47d]">3.</span>
              <span className="leading-relaxed">Transfer the details amount to this Account</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Crypto Wallets Section */}
      <Card className="border-0 shadow-md rounded-3xl bg-white dark:bg-gray-800">
        <CardContent className="p-6 sm:p-8">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-base sm:text-lg leading-relaxed">
            Click on any of the crypto methods below to be taken directly to deposit.
          </h3>

          {error && (
            <Alert variant="destructive" className="mb-6 rounded-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {wallets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No crypto deposit options available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {wallets.map((wallet) => (
                <div key={wallet.id} className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group" onClick={() => handleOpenSubmitDialog(wallet.id)}>
                  <div className="h-14 w-14 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform overflow-hidden">
                    {wallet.logo_url ? (
                      <img
                        src={wallet.logo_url}
                        alt={wallet.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="font-bold text-gray-600 dark:text-gray-300">
                        {wallet.symbol.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white text-center line-clamp-1">{wallet.name}</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{wallet.symbol}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Deposit Request</DialogTitle>
            <DialogDescription>
              Fill in the details of your crypto deposit. Admin will review and approve it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Deposit Address ({wallets.find(w => w.id === selectedWalletId)?.symbol})
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono break-all bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                  {wallets.find(w => w.id === selectedWalletId)?.wallet_address}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const address = wallets.find(w => w.id === selectedWalletId)?.wallet_address;
                    if (address) handleCopyAddress(address, -3);
                  }}
                  className="shrink-0"
                >
                  {copiedId === -3 ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-red-500 mt-2">
                * Please send only {wallets.find(w => w.id === selectedWalletId)?.symbol} to this address on the {wallets.find(w => w.id === selectedWalletId)?.network || "correct"} network.
              </p>
            </div>
            <form onSubmit={handleSubmitDeposit} className="space-y-4">
              <div>
              <Label htmlFor="account">Select Account *</Label>
              <Select
                value={submitForm.account_id}
                onValueChange={(value) =>
                  setSubmitForm({ ...submitForm, account_id: value })
                }
                required
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select account to credit" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.length === 0 ? (
                    <SelectItem value="no-accounts" disabled>
                      No accounts available
                    </SelectItem>
                  ) : (
                    accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.account_type?.name || "Account"} - {account.account_number} (${parseFloat(account.balance || "0").toFixed(2)})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {accounts.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  You don't have any active accounts. Please create an account first.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="crypto">Cryptocurrency</Label>
              <Input
                id="crypto"
                value={wallets.find(w => w.id === selectedWalletId)?.name || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {wallets.find(w => w.id === selectedWalletId)?.symbol} - {wallets.find(w => w.id === selectedWalletId)?.network || "N/A"}
              </p>
            </div>

            <div>
              <Label htmlFor="amount">Amount (USD) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={submitForm.amount}
                onChange={(e) =>
                  setSubmitForm({ ...submitForm, amount: e.target.value })
                }
                placeholder="0.00"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the USD equivalent of the crypto you sent
              </p>
            </div>

            <div>
              <Label htmlFor="transaction_hash">Transaction Hash (Optional)</Label>
              <Input
                id="transaction_hash"
                value={submitForm.transaction_hash}
                onChange={(e) =>
                  setSubmitForm({ ...submitForm, transaction_hash: e.target.value })
                }
                placeholder="Enter blockchain transaction hash if available"
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This helps verify your transaction faster
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSubmitDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

