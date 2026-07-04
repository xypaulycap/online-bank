"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { accountService, categoryService, userService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { AlertTriangle } from "lucide-react";

interface Account {
  id: number;
  account_type: { name: string };
  account_number: string;
  balance: string;
}

interface Category {
  id: number;
  name: string;
}


export default function Transactions() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sourceAccountId, setSourceAccountId] = useState<string>("");
  const [recipientAccountId, setRecipientAccountId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");

  // Common Bank Fields
  const [bankName, setBankName] = useState<string>("");
  const [bankAddress, setBankAddress] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [swiftBic, setSwiftBic] = useState<string>("");
  const [transferReference, setTransferReference] = useState<string>("");

  // Local Transfer specific
  const [swissIban, setSwissIban] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  
  const [pin, setPin] = useState<string>("");
  const [pin2, setPin2] = useState<string>("");
  const [pinStep, setPinStep] = useState<1 | 2>(1);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [pendingTransactionId, setPendingTransactionId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState<string>("");
  const [pendingTransferData, setPendingTransferData] = useState<any>(null);
  const [user, setUser] = useState<{ can_transfer?: boolean; has_pin_2?: boolean } | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const [accountsData, categoriesData, userData] = await Promise.all([
          accountService.getAccounts(),
          categoryService.getCategories(),
          userService.getCurrentUser(),
        ]);
        
        if (userData) {
          setUser(userData);
        }

        setAccounts(accountsData.map(acc => ({
          id: acc.id,
          account_type: acc.account_type,
          account_number: acc.account_number,
          balance: acc.balance,
        })));
        setCategories(categoriesData);
      } catch (err: any) {
        setError("Failed to load data");
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      }
    };

    fetchData();
  }, [router, toast]);

  const handleSubmit = async (e: React.FormEvent, action: 'transfer' | 'local_transfer' | 'international_transfer') => {
    e.preventDefault();
    
    if (user?.can_transfer === false) {
      setIsWarningDialogOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      if (!sourceAccountId || !amount) {
        throw new Error("Please fill in all required fields");
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const accountIdNum = parseInt(sourceAccountId);
      const categoryIdNum = categoryId ? parseInt(categoryId) : undefined;

      if (action === 'transfer') {
        if (!recipientAccountId) throw new Error("Please select a recipient account");
        if (sourceAccountId === recipientAccountId) throw new Error("Source and recipient accounts must be different");
        
        setPendingTransferData({ action: 'transfer', accountIdNum, recipientAccountId: parseInt(recipientAccountId), amountNum, description, categoryIdNum });
        setIsOtpDialogOpen(true);
      } else if (action === 'local_transfer') {
        if (!bankName || !bankAddress || !recipientAddress || !recipientName || !swissIban) {
          throw new Error("Please fill in all required fields");
        }
        
        const bankDetails = {
          bank_name: bankName,
          bank_address: bankAddress,
          recipient_address: recipientAddress,
          recipient_name: recipientName,
          swiss_iban: swissIban,
          reference_number: referenceNumber,
          message: message
        };
        
        setPendingTransferData({ action: 'local_transfer', accountIdNum, amountNum, description, categoryIdNum, bankDetails });
        setIsPinDialogOpen(true);
      } else if (action === 'international_transfer') {
        if (!recipientName || !recipientAddress || !bankName || !bankAddress || !accountNumber || !swiftBic) {
          throw new Error("Please fill in all required fields");
        }

        const bankDetails = {
          recipient_name: recipientName,
          recipient_address: recipientAddress,
          bank_name: bankName,
          bank_address: bankAddress,
          account_number: accountNumber,
          swift_bic: swiftBic,
          transfer_reference: transferReference
        };

        setPendingTransferData({ action: 'international_transfer', accountIdNum, amountNum, description, categoryIdNum, bankDetails });
        setIsPinDialogOpen(true);
      }
    } catch (err: any) {
      if (err.message === 'TRANSFER_DISABLED') {
        setIsWarningDialogOpen(true);
      } else {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid OTP",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (pendingTransferData.action === 'transfer') {
        await accountService.transfer(pendingTransferData.accountIdNum, pendingTransferData.recipientAccountId, pendingTransferData.amountNum, pendingTransferData.description || 'Internal Transfer', pendingTransferData.categoryIdNum);
        toast({ title: "Success", description: "Internal transfer completed successfully" });
      }
      setIsOtpDialogOpen(false);
      router.push("/dashboard");
    } catch (err: any) {
      if (err.message === 'TRANSFER_DISABLED') {
        setIsOtpDialogOpen(false);
        setIsWarningDialogOpen(true);
      } else {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pinStep === 1) {
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "PIN must be exactly 4 digits",
        });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let transactionId;
        if (pendingTransferData.action === 'local_transfer') {
          transactionId = await accountService.createPendingLocalTransfer(
            pendingTransferData.accountIdNum,
            pendingTransferData.amountNum,
            pendingTransferData.description || 'Local Transfer',
            pendingTransferData.categoryIdNum,
            pendingTransferData.bankDetails,
            pin
          );
        } else if (pendingTransferData.action === 'international_transfer') {
          transactionId = await accountService.createPendingInternationalTransfer(
            pendingTransferData.accountIdNum,
            pendingTransferData.amountNum,
            pendingTransferData.description || 'International Transfer',
            pendingTransferData.categoryIdNum,
            pendingTransferData.bankDetails,
            pin
          );
        } else {
          throw new Error("Invalid transfer type for PIN verification");
        }

        setPendingTransactionId(transactionId);

        if (user?.has_pin_2) {
          setPinStep(2);
          setPin("");
          toast({
            title: "Stage 1 Verified",
            description: "Please enter the PIN sent to you to complete the transfer.",
          });
          setIsLoading(false);
          return;
        }

        await accountService.completePendingWireTransfer(transactionId, "SKIP");

        toast({
          title: "Success",
          description: "Transfer completed successfully",
        });

        setPin("");
        setPin2("");
        setPinStep(1);
        setPendingTransactionId(null);
        setIsPinDialogOpen(false);
        router.push("/dashboard");
      } catch (err: any) {
        if (err.message === 'TRANSFER_DISABLED') {
          setIsPinDialogOpen(false);
          setIsWarningDialogOpen(true);
        } else {
          setError(err.message);
          toast({
            variant: "destructive",
            title: "Error",
            description: err.message,
          });
        }
        setIsLoading(false);
      }
    } else {
      if (pin2.length !== 4 || !/^\d{4}$/.test(pin2)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Second PIN must be exactly 4 digits",
        });
        return;
      }

      if (!pendingTransactionId) {
        setError("Transaction ID missing");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await accountService.completePendingWireTransfer(pendingTransactionId, pin2);

        toast({
          title: "Success",
          description: "Transfer completed successfully",
        });

        setPin("");
        setPin2("");
        setPinStep(1);
        setPendingTransactionId(null);
        setIsPinDialogOpen(false);
        router.push("/dashboard");
      } catch (err: any) {
        if (err.message === 'TRANSFER_DISABLED') {
          setIsPinDialogOpen(false);
          setIsWarningDialogOpen(true);
        } else {
          setError(err.message);
          toast({
            variant: "destructive",
            title: "Error",
            description: err.message,
          });
        }
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Transfer Funds</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
          <Tabs defaultValue="transfer">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-2 sm:gap-0">
              <TabsTrigger value="transfer">Internal</TabsTrigger>
              <TabsTrigger value="local_transfer">Local</TabsTrigger>
              <TabsTrigger value="international_transfer">International</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transfer">
              <form onSubmit={(e) => handleSubmit(e, 'transfer')} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="source_account">Source Account</Label>
                  <Select value={sourceAccountId} onValueChange={setSourceAccountId} required>
                    <SelectTrigger id="source_account">
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.account_type.name} - ****{account.account_number.slice(-4)} ($
                          {parseFloat(account.balance).toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recipient_account">Recipient Account</Label>
                  <Select value={recipientAccountId} onValueChange={setRecipientAccountId} required>
                    <SelectTrigger id="recipient_account">
                      <SelectValue placeholder="Select recipient account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts
                        .filter((account) => account.id.toString() !== sourceAccountId)
                        .map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.account_type.name} - ****{account.account_number.slice(-4)} ($
                            {parseFloat(account.balance).toFixed(2)})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Transferring..." : "Transfer"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="local_transfer">
              <form onSubmit={(e) => handleSubmit(e, 'local_transfer')} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="source_account_local">Source Account</Label>
                  <Select value={sourceAccountId} onValueChange={setSourceAccountId} required>
                    <SelectTrigger id="source_account_local">
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.account_type.name} - ****{account.account_number.slice(-4)} ($
                          {parseFloat(account.balance).toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount_local">Amount</Label>
                  <Input
                    id="amount_local"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                
                <div className="pt-4 pb-2 border-b border-border">
                  <h3 className="font-medium text-sm text-muted-foreground">Bank Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank_name_local">Bank Name</Label>
                    <Input id="bank_name_local" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Enter bank name" required />
                  </div>
                  <div>
                    <Label htmlFor="bank_address_local">Bank Address</Label>
                    <Input id="bank_address_local" value={bankAddress} onChange={(e) => setBankAddress(e.target.value)} placeholder="Enter bank address" required />
                  </div>
                </div>

                <div className="pt-4 pb-2 border-b border-border">
                  <h3 className="font-medium text-sm text-muted-foreground">Recipient Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient_name_local">Recipient Name</Label>
                    <Input id="recipient_name_local" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Enter recipient name" required />
                  </div>
                  <div>
                    <Label htmlFor="recipient_address_local">Recipient Address</Label>
                    <Input id="recipient_address_local" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="Enter recipient address" required />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="swiss_iban">Swiss IBAN (CHxx xxxx xxxx xxxx xxxx x)</Label>
                    <Input id="swiss_iban" value={swissIban} onChange={(e) => setSwissIban(e.target.value)} placeholder="Enter Swiss IBAN" required />
                  </div>
                  <div>
                    <Label htmlFor="reference_number">Reference Number (Optional)</Label>
                    <Input id="reference_number" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Enter reference number" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Input id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter message" />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Initiating Transfer..." : "Transfer"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="international_transfer">
              <form onSubmit={(e) => handleSubmit(e, 'international_transfer')} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="source_account_intl">Source Account</Label>
                  <Select value={sourceAccountId} onValueChange={setSourceAccountId} required>
                    <SelectTrigger id="source_account_intl">
                      <SelectValue placeholder="Select source account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.account_type.name} - ****{account.account_number.slice(-4)} ($
                          {parseFloat(account.balance).toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount_intl">Amount</Label>
                  <Input
                    id="amount_intl"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                
                <div className="pt-4 pb-2 border-b border-border">
                  <h3 className="font-medium text-sm text-muted-foreground">Bank Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bank_name_intl">Bank Name</Label>
                    <Input id="bank_name_intl" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Enter bank name" required />
                  </div>
                  <div>
                    <Label htmlFor="bank_address_intl">Bank Address</Label>
                    <Input id="bank_address_intl" value={bankAddress} onChange={(e) => setBankAddress(e.target.value)} placeholder="Enter bank address" required />
                  </div>
                  <div>
                    <Label htmlFor="swift_bic">SWIFT/BIC</Label>
                    <Input id="swift_bic" value={swiftBic} onChange={(e) => setSwiftBic(e.target.value)} placeholder="Enter SWIFT or BIC" required />
                  </div>
                </div>

                <div className="pt-4 pb-2 border-b border-border">
                  <h3 className="font-medium text-sm text-muted-foreground">Recipient Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipient_name_intl">Recipient Name</Label>
                    <Input id="recipient_name_intl" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Enter recipient name" required />
                  </div>
                  <div>
                    <Label htmlFor="recipient_address_intl">Recipient Address</Label>
                    <Input id="recipient_address_intl" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="Enter recipient address" required />
                  </div>
                  <div>
                    <Label htmlFor="account_number_intl">Account Number</Label>
                    <Input id="account_number_intl" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Enter account number" required />
                  </div>
                  <div>
                    <Label htmlFor="transfer_reference">Transfer Reference (Optional)</Label>
                    <Input id="transfer_reference" value={transferReference} onChange={(e) => setTransferReference(e.target.value)} placeholder="Enter reference" />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Initiating Transfer..." : "Transfer"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isPinDialogOpen} onOpenChange={(open) => {
        setIsPinDialogOpen(open);
        if (!open) {
          setPin("");
          setPin2("");
          setPinStep(1);
          if (pendingTransactionId) {
             toast({
                title: "Transaction Pending",
                description: "Transaction was created but not finalized.",
             });
          }
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pinStep === 1 ? "Enter PIN to Complete Transfer" : "Enter Sent PIN"}
            </DialogTitle>
            <DialogDescription>
              {pinStep === 1 
                ? "Enter your 4-digit PIN to approve and complete the transfer." 
                : "Please enter the PIN sent to you to finalize the transfer."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            {pinStep === 1 ? (
              <div>
                <Label htmlFor="pin">4-Digit PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPin(value);
                  }}
                  placeholder="0000"
                  required
                  className="font-mono text-center text-2xl tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your 4-digit transfer PIN
                </p>
              </div>
            ) : (
              <div>
                <Label htmlFor="pin2">PIN Sent to You</Label>
                <Input
                  id="pin2"
                  type="password"
                  maxLength={4}
                  value={pin2}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setPin2(value);
                  }}
                  placeholder="0000"
                  required
                  className="font-mono text-center text-2xl tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the PIN sent to you
                </p>
              </div>
            )}
            
            {error && (
              <div className="text-sm font-medium text-destructive">
                {error}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPinDialogOpen(false);
                  setPin("");
                  setPin2("");
                  setPinStep(1);
                  if (pendingTransactionId) {
                    toast({
                        title: "Transaction Pending",
                        description: "Transaction was created but not finalized.",
                    });
                  }
                }}
                className="w-full sm:flex-1"
              >
                Complete Later
              </Button>
              <Button
                type="submit"
                disabled={isLoading || (pinStep === 1 ? pin.length !== 4 : pin2.length !== 4)}
                className="w-full sm:flex-1"
              >
                {isLoading 
                  ? "Processing..." 
                  : (pinStep === 1 && user?.has_pin_2 ? "Next" : "Complete Transfer")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OTP Verification Required</DialogTitle>
            <DialogDescription>
              Additional verification is needed to complete this transfer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Please provide the Otp sent to your mobile number.
              </p>
            </div>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="font-mono tracking-widest text-center text-lg"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={isLoading} className="w-full sm:flex-1">
                {isLoading ? "Verifying..." : "Submit"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsOtpDialogOpen(false)} className="w-full sm:flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Transfer Disabled
            </DialogTitle>
            <DialogDescription>
              Your transfer functionality has been disabled by the bank.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                You are unable to make transfers at this time. Please contact the bank via live chat to resolve this issue.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="default"
                onClick={() => {
                  setIsWarningDialogOpen(false);
                  router.push("/dashboard");
                }}
                className="w-full sm:flex-1"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsWarningDialogOpen(false)}
                className="w-full sm:flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}