"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cryptoWalletService, accountService, depositRequestService, publicSettingsService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { Copy, Check, Wallet, AlertCircle, Send, User, Landmark, Hash, Share2 } from "lucide-react";
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
    account_number: "Loading...",
    bank_name: "Loading...",
    account_name: "Loading...",
    routing_number: "Loading...",
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
        // Fetch user profile first for user-specific bank details
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('admin_bank_details')
          .eq('id', session.user.id)
          .single();
          
        let details = profile?.admin_bank_details;
        
        // Check if details is an empty object or has empty fields, fallback if needed
        if (!details || (!details.account_number && !details.bank_name)) {
          details = await publicSettingsService.getSetting('bank_details');
        }

        if (details) {
          setAdminBankDetails({
            account_number: details.account_number || "N/A",
            bank_name: details.bank_name || "N/A",
            account_name: details.account_name || "N/A",
            routing_number: details.routing_number || "N/A",
          });
        } else {
          setAdminBankDetails({
            account_number: "704 337 8748",
            bank_name: "OPay Digital Service Limited (OPay)",
            account_name: "EWEAN PATRICK AIYOHUYIN",
            routing_number: "N/A",
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
      <Card className="border-0 shadow-md rounded-3xl overflow-hidden bg-white dark:bg-gray-800">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-lg">
              123
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">Account Number</p>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{adminBankDetails.account_number}</p>
            </div>
          </div>
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-5"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-[#e6f7f2] dark:bg-[#00b47d]/20 rounded-2xl flex items-center justify-center text-[#00b47d]">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">Bank</p>
              <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{adminBankDetails.bank_name}</p>
            </div>
          </div>
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-5"></div>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-gray-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-400">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">Name</p>
              <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{adminBankDetails.account_name}</p>
            </div>
          </div>
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-5"></div>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-[#e6f7f2] dark:bg-[#00b47d]/20 rounded-2xl flex items-center justify-center text-[#00b47d]">
              <Hash className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">Bank Swift Code</p>
              <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{adminBankDetails.routing_number}</p>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-4">
            <Button 
              variant="secondary" 
              className="flex-1 bg-[#e6f7f2] text-[#00b47d] hover:bg-[#d1f0e6] dark:bg-[#00b47d]/10 dark:text-[#00b47d] dark:hover:bg-[#00b47d]/20 rounded-full h-12 sm:h-14 font-semibold text-sm sm:text-base border-0 shadow-none"
              onClick={() => handleCopyAddress(adminBankDetails.account_number, -1)}
            >
              {copiedId === -1 ? "Copied!" : "Copy Number"}
            </Button>
            <Button 
              className="flex-1 bg-[#00c288] hover:bg-[#00a876] text-white rounded-full h-12 sm:h-14 font-semibold text-sm sm:text-base border-0 shadow-none"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Bank Details',
                    text: `Bank: ${adminBankDetails.bank_name}\nAccount: ${adminBankDetails.account_number}\nName: ${adminBankDetails.account_name}\nRouting Number: ${adminBankDetails.routing_number}`,
                  });
                } else {
                  handleCopyAddress(`Bank: ${adminBankDetails.bank_name}\nAccount: ${adminBankDetails.account_number}\nName: ${adminBankDetails.account_name}\nRouting Number: ${adminBankDetails.routing_number}`, -2);
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
              <span className="leading-relaxed">Copy the account details above-{adminBankDetails.account_number} is your Account Number</span>
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

