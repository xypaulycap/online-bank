"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { adminSettingsService } from "@/lib/admin-services";
import { Save, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bank_name: "SWISS PRIVATE BANK",
    account_holder: "",
    account_number: "",
    iban: "",
    swift_bic: "",
    currency: "CHF / USD",
    client_number: "",
    bank_address: "Zurich, Switzerland",
    account_type: "Private Current Account",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const details = await adminSettingsService.getAdminSettings("bank_details");
      if (details) {
        setBankDetails({
          bank_name: details.bank_name || "SWISS PRIVATE BANK",
          account_holder: details.account_holder || details.account_name || "",
          account_number: details.account_number || "",
          iban: details.iban || "",
          swift_bic: details.swift_bic || details.routing_number || "",
          currency: details.currency || "CHF / USD",
          client_number: details.client_number || "",
          bank_address: details.bank_address || "Zurich, Switzerland",
          account_type: details.account_type || "Private Current Account",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...bankDetails,
        account_name: bankDetails.account_holder,
        routing_number: bankDetails.swift_bic,
      };
      await adminSettingsService.updateAdminSettings("bank_details", payload);
      toast({
        title: "Settings Saved",
        description: "Admin bank details have been updated successfully.",
      });
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage application-wide configurations and information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Bank Details</CardTitle>
          <CardDescription>
            These details will be shown to users on the Deposit page for making bank transfers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name / Header</Label>
              <Input
                id="bank_name"
                value={bankDetails.bank_name}
                onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                placeholder="e.g. SWISS PRIVATE BANK"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_holder">Account Holder</Label>
              <Input
                id="account_holder"
                value={bankDetails.account_holder}
                onChange={(e) => setBankDetails({ ...bankDetails, account_holder: e.target.value })}
                placeholder="e.g. Daniel Mercer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Account No.</Label>
              <Input
                id="account_number"
                value={bankDetails.account_number}
                onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                placeholder="e.g. 4587-XXXX-XX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                value={bankDetails.iban}
                onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                placeholder="e.g. CHXX XXXX XXXX XXXX XXXX X"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="swift_bic">SWIFT / BIC</Label>
              <Input
                id="swift_bic"
                value={bankDetails.swift_bic}
                onChange={(e) => setBankDetails({ ...bankDetails, swift_bic: e.target.value })}
                placeholder="e.g. XXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={bankDetails.currency}
                onChange={(e) => setBankDetails({ ...bankDetails, currency: e.target.value })}
                placeholder="e.g. CHF / USD"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_number">Client No.</Label>
              <Input
                id="client_number"
                value={bankDetails.client_number}
                onChange={(e) => setBankDetails({ ...bankDetails, client_number: e.target.value })}
                placeholder="e.g. C-XXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_type">Account Type</Label>
              <Input
                id="account_type"
                value={bankDetails.account_type}
                onChange={(e) => setBankDetails({ ...bankDetails, account_type: e.target.value })}
                placeholder="e.g. Private Current Account"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bank_address">Bank Address</Label>
              <Input
                id="bank_address"
                value={bankDetails.bank_address}
                onChange={(e) => setBankDetails({ ...bankDetails, bank_address: e.target.value })}
                placeholder="e.g. Zurich, Switzerland"
              />
            </div>
          </div>

          <Button 
            className="w-full mt-4" 
            onClick={handleSave} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
