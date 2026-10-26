"use client";

import { useEffect, useState } from "react";
import { adminInquiryService } from "@/lib/admin-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  HelpCircle,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Trash2,
  ExternalLink,
} from "lucide-react";

interface Inquiry {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  category: string;
  message: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  priority: "normal" | "urgent";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      const data = await adminInquiryService.getAllInquiries(
        statusFilter === "all" ? undefined : statusFilter
      );
      setInquiries(data || []);
    } catch (error: any) {
      console.error("Error fetching inquiries:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load inquiries",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const handleOpenDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setNewStatus(inquiry.status);
    setAdminNotes(inquiry.admin_notes || "");
    setIsDialogOpen(true);
  };

  const handleUpdateInquiry = async () => {
    if (!selectedInquiry) return;
    setIsUpdating(true);
    try {
      await adminInquiryService.updateInquiry(selectedInquiry.id, {
        status: newStatus,
        admin_notes: adminNotes,
      });

      toast({
        title: "Inquiry Updated",
        description: `Status updated to ${newStatus}${selectedInquiry.user_id ? " and customer was notified" : ""}.`,
      });

      setIsDialogOpen(false);
      fetchInquiries();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not update inquiry",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await adminInquiryService.deleteInquiry(id);
      toast({
        title: "Deleted",
        description: "Inquiry has been deleted.",
      });
      if (selectedInquiry?.id === id) {
        setIsDialogOpen(false);
      }
      fetchInquiries();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Could not delete inquiry",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const query = searchQuery.toLowerCase();
    return (
      inq.name.toLowerCase().includes(query) ||
      inq.email.toLowerCase().includes(query) ||
      inq.subject.toLowerCase().includes(query) ||
      inq.category.toLowerCase().includes(query) ||
      inq.message.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === "pending").length,
    inProgress: inquiries.filter((i) => i.status === "in_progress").length,
    resolved: inquiries.filter((i) => i.status === "resolved").length,
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Inquiries</h1>
          <p className="text-muted-foreground">
            Manage inquiries, support tickets, and customer contact submissions.
          </p>
        </div>
        <Button onClick={fetchInquiries} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium">Total Inquiries</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-amber-200 dark:border-amber-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium text-amber-600 dark:text-amber-400">
              Pending Action
            </CardDescription>
            <CardTitle className="text-2xl text-amber-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-blue-200 dark:border-blue-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium text-blue-600 dark:text-blue-400">
              In Progress
            </CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-medium text-emerald-600 dark:text-emerald-400">
              Resolved
            </CardDescription>
            <CardTitle className="text-2xl text-emerald-600">{stats.resolved}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inquiries..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Filter Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inquiries & Support Requests</CardTitle>
          <CardDescription>
            Showing {filteredInquiries.length} {filteredInquiries.length === 1 ? "inquiry" : "inquiries"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading inquiries...</div>
          ) : filteredInquiries.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <HelpCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No inquiries found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subject & Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{inquiry.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {inquiry.email}
                        </div>
                        {inquiry.phone && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" />
                            {inquiry.phone}
                          </div>
                        )}
                        {inquiry.user_id && (
                          <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                            Registered Member
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium max-w-xs truncate">{inquiry.subject}</div>
                        <div className="text-xs text-muted-foreground capitalize mt-0.5">
                          {inquiry.category}
                        </div>
                      </TableCell>
                      <TableCell>
                        {inquiry.priority === "urgent" ? (
                          <Badge variant="destructive" className="uppercase text-[10px]">Urgent</Badge>
                        ) : (
                          <Badge variant="secondary" className="uppercase text-[10px]">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(inquiry.created_at).toLocaleDateString()}{" "}
                        {new Date(inquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetails(inquiry)}
                          >
                            View & Respond
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                            onClick={() => handleDeleteInquiry(inquiry.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details & Status Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedInquiry && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl">Inquiry Details</DialogTitle>
                  {getStatusBadge(selectedInquiry.status)}
                </div>
                <DialogDescription>
                  Submitted on {new Date(selectedInquiry.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* Contact info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/40 rounded-lg text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">Customer Name</span>
                    <span className="font-semibold">{selectedInquiry.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Email</span>
                    <a href={`mailto:${selectedInquiry.email}`} className="text-primary hover:underline flex items-center gap-1">
                      {selectedInquiry.email}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Phone</span>
                    <span>{selectedInquiry.phone || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Category / Priority</span>
                    <span className="capitalize">{selectedInquiry.category}</span> • <span className="uppercase font-semibold text-xs">{selectedInquiry.priority}</span>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-1">Subject</h4>
                  <p className="font-medium text-base">{selectedInquiry.subject}</p>
                </div>

                {/* Message Body */}
                <div>
                  <h4 className="text-xs uppercase font-semibold text-muted-foreground mb-1">Message</h4>
                  <div className="p-4 bg-muted/30 rounded-lg whitespace-pre-wrap text-sm leading-relaxed border">
                    {selectedInquiry.message}
                  </div>
                </div>

                {/* Status and Admin Notes */}
                <div className="space-y-3 pt-2 border-t">
                  <h4 className="text-sm font-semibold">Update Status & Resolution Notes</h4>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved (Notifies customer if registered)</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Admin Notes / Response (Recorded with this ticket)
                    </label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes or resolution summary..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="flex sm:justify-between items-center gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject)}`}
                    className="inline-flex items-center"
                  >
                    <Button variant="secondary" type="button">
                      <Mail className="h-4 w-4 mr-2" />
                      Reply by Email
                    </Button>
                  </a>
                  <Button
                    onClick={handleUpdateInquiry}
                    disabled={isUpdating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
