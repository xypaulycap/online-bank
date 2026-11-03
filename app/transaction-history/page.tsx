"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2 } from "lucide-react";
import { transactionService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";

interface Transaction {
  id: number;
  account: number;
  transaction_type: "withdrawal" | "deposit" | "transfer" | "payment" | "local_transfer" | "wire_transfer" | "international_transfer";
  amount: string;
  description: string;
  category: { id: number; name: string; description: string } | null;
  recipient_account: number | null;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

function extractDescriptionField(description: string | null | undefined, label: string): string | null {
  if (!description) return null;
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = description.match(new RegExp(`${escapedLabel}:\\s*(.+)`));
  return match?.[1]?.trim() || null;
}

function extractEmailField(description: string | null | undefined): string | null {
  return (
    extractDescriptionField(description, "Sender Email") ||
    extractDescriptionField(description, "Recipient Email")
  );
}

function getTransactionSummary(description: string | null | undefined, fallback: string): string {
  if (!description) return fallback;

  const cleaned = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (line) =>
        !line.startsWith("Recipient Account:") &&
        !line.startsWith("Sender Email:") &&
        !line.startsWith("Recipient Email:") &&
        !line.startsWith("Bank Details:") &&
        !line.startsWith("Bank Name:") &&
        !line.startsWith("Address:") &&
        !line.startsWith("Sort Code:")
    )[0];

  return cleaned || fallback;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<string>("all");
  const router = useRouter();
  const { toast } = useToast();

  const transactionsPerPage = 10;

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const filters: any = {};
        if (filterType !== "all") {
          filters.transaction_type = filterType;
        }

        const fetchedTransactions = await transactionService.getTransactions(filters);
        setAllTransactions(fetchedTransactions);
      } catch (err: any) {
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

    fetchTransactions();
  }, [filterType, router, toast]);

  useEffect(() => {
    // Client-side pagination
    const startIndex = (page - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
    setTransactions(paginatedTransactions);
  }, [page, allTransactions]);

  const totalPages = Math.ceil(allTransactions.length / transactionsPerPage) || 1;

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handleDownloadReceipt = async (transactionId: number) => {
    setDownloadingId(transactionId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please log in to download receipts.",
        });
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/receipt?transactionId=${transactionId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to download receipt");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Transaction_Receipt_TXN_${transactionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: `Receipt for transaction #${transactionId} downloaded successfully.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: err.message || "Could not download receipt. Please try again.",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-green-50/50 p-4 md:p-6">
      <Card className="max-w-5xl mx-auto border-green-500 shadow-green-100">
        <CardHeader className="bg-green-100/70">
          <CardTitle className="text-green-800">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
          <div className="flex justify-end">
            <Select
              value={filterType}
              onValueChange={(value: string) => {
                setFilterType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[190px] border-green-500 focus:ring-green-500">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="transfer">Transfers</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isLoading ? (
            <div className="py-8 text-center text-green-700">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No transactions found.</div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-100/60">
                    <TableHead className="text-green-800 font-semibold">ID</TableHead>
                    <TableHead className="text-green-800 font-semibold">Type</TableHead>
                    <TableHead className="text-green-800 font-semibold">Amount</TableHead>
                    <TableHead className="text-green-800 font-semibold">Status</TableHead>
                    <TableHead className="text-green-800 font-semibold">Category</TableHead>
                    <TableHead className="text-green-800 font-semibold">Date</TableHead>
                    <TableHead className="text-green-800 font-semibold">Description</TableHead>
                    <TableHead className="text-green-800 font-semibold text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => {
                    const recipientEmail = extractEmailField(txn.description);
                    const summary = getTransactionSummary(
                      txn.description,
                      txn.transaction_type.charAt(0).toUpperCase() + txn.transaction_type.slice(1).replace("_", " ")
                    );
                    const isCredit = txn.transaction_type === 'deposit';

                    return (
                      <TableRow key={txn.id} className="hover:bg-muted/40">
                        <TableCell className="font-mono text-xs">#{txn.id}</TableCell>
                        <TableCell className="capitalize whitespace-nowrap">
                          {txn.transaction_type.replace("_", " ")}
                        </TableCell>
                        <TableCell className={isCredit ? 'text-green-600 font-semibold whitespace-nowrap' : 'text-red-600 font-semibold whitespace-nowrap'}>
                          {isCredit ? '+' : '-'}${parseFloat(txn.amount || '0').toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={txn.status === 'approved' ? 'default' : txn.status === 'pending' ? 'secondary' : 'destructive'} 
                            className="capitalize text-[11px]"
                          >
                            {txn.status || 'approved'}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{txn.category?.name || "N/A"}</TableCell>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(txn.timestamp).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="space-y-0.5">
                            <div className="truncate text-xs font-medium" title={summary}>{summary}</div>
                            {txn.transaction_type === "wire_transfer" && recipientEmail && (
                              <div className="text-[11px] text-muted-foreground truncate" title={recipientEmail}>
                                Email: {recipientEmail}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs font-medium border-green-600 text-green-700 hover:bg-green-100 hover:text-green-900 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950 inline-flex items-center gap-1.5 shadow-xs"
                            onClick={() => handleDownloadReceipt(txn.id)}
                            disabled={downloadingId === txn.id}
                            title={`Download receipt for transaction #${txn.id}`}
                          >
                            {downloadingId === txn.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            <span className="hidden sm:inline">Receipt</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t py-4">
          <Button
            onClick={handlePreviousPage}
            disabled={page === 1 || isLoading}
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-100"
          >
            Previous
          </Button>
          <span className="text-sm font-medium text-green-800 self-center">
            Page {page} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={page === totalPages || isLoading}
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-100"
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
