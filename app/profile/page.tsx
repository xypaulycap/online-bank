"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { userService, accountService, notificationService } from "@/lib/supabase-services";
import { supabase } from "@/lib/supabase";
import { ImageUpload } from "@/components/image-upload";
import { getProfilePictureUrl } from "@/lib/image-utils";
import {
  User,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Check,
  X,
} from "lucide-react";

interface UserData {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface UserProfile {
  id: string;
  phone_number: string | null;
  address: string | null;
  date_of_birth: string | null;
  profile_picture: string | null;
}

interface Account {
  id: number;
  account_type: { name: string };
  account_number: string;
  balance: string;
}

const profileFormSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam === "security" ? "security" : "profile");

  const [user, setUser] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      address: "",
      date_of_birth: "",
    },
  });

  useEffect(() => {
    if (tabParam === "security") {
      setActiveTab("security");
    }
  }, [tabParam]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        let userData = await userService.getCurrentUser();

        if (!userData) {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            try {
              const { data: newProfile, error: createError } = await supabase
                .from("user_profiles")
                .insert({
                  id: authUser.id,
                  username: authUser.user_metadata?.username || authUser.email?.split("@")[0] || "user",
                  first_name: authUser.user_metadata?.first_name || null,
                  last_name: authUser.user_metadata?.last_name || null,
                  is_admin: false,
                })
                .select()
                .single();

              if (!createError && newProfile) {
                userData = {
                  id: newProfile.id,
                  email: authUser.email || "",
                  username: newProfile.username || "",
                  first_name: newProfile.first_name || "",
                  last_name: newProfile.last_name || "",
                };
              } else {
                userData = {
                  id: authUser.id,
                  email: authUser.email || "",
                  username: authUser.user_metadata?.username || authUser.email?.split("@")[0] || "user",
                  first_name: authUser.user_metadata?.first_name || "",
                  last_name: authUser.user_metadata?.last_name || "",
                };
              }
            } catch (err) {
              userData = {
                id: authUser.id,
                email: authUser.email || "",
                username: authUser.user_metadata?.username || authUser.email?.split("@")[0] || "user",
                first_name: authUser.user_metadata?.first_name || "",
                last_name: authUser.user_metadata?.last_name || "",
              };
            }
          }
        }

        if (userData) {
          setUser({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
          });
        }

        // Fetch accounts
        try {
          const accountsData = await accountService.getAccounts();
          if (accountsData) {
            setAccounts(
              accountsData.map((acc: any) => ({
                id: acc.id,
                account_type: acc.account_type,
                account_number: acc.account_number,
                balance: acc.balance,
              }))
            );
          }
        } catch (accError) {
          console.warn("Could not fetch accounts:", accError);
        }

        // Fetch profile details
        try {
          const { data: profileData } = await supabase
            .from("user_profiles")
            .select("id, phone_number, address, date_of_birth, profile_picture")
            .eq("id", session.user.id)
            .maybeSingle();

          if (profileData) {
            setProfile(profileData);
            if (profileData.profile_picture) {
              setProfilePictureUrl(profileData.profile_picture);
            }

            form.reset({
              first_name: userData?.first_name || "",
              last_name: userData?.last_name || "",
              phone_number: profileData.phone_number || "",
              address: profileData.address || "",
              date_of_birth: profileData.date_of_birth || "",
            });
          } else {
            form.reset({
              first_name: userData?.first_name || "",
              last_name: userData?.last_name || "",
              phone_number: "",
              address: "",
              date_of_birth: "",
            });
          }
        } catch (profileError) {
          form.reset({
            first_name: userData?.first_name || "",
            last_name: userData?.last_name || "",
            phone_number: "",
            address: "",
            date_of_birth: "",
          });
        }
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

    fetchData();
  }, [router, toast, form]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      await userService.updateProfile({
        phone_number: data.phone_number || null,
        address: data.address || null,
        date_of_birth: data.date_of_birth || null,
        profile_picture: profilePictureUrl || null,
      });

      // Also update first_name and last_name if changed
      if (data.first_name !== undefined || data.last_name !== undefined) {
        await supabase
          .from("user_profiles")
          .update({
            first_name: data.first_name || null,
            last_name: data.last_name || null,
          })
          .eq("id", session.user.id);
      }

      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your personal details have been successfully saved.",
      });

      const updatedUser = await userService.getCurrentUser();
      if (updatedUser) {
        setUser({
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message,
      });
    }
  };

  // Password change handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your current password.",
      });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "New password must be at least 8 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Mismatch",
        description: "New password and confirmation do not match.",
      });
      return;
    }

    if (newPassword === currentPassword) {
      toast({
        variant: "destructive",
        title: "Invalid Password",
        description: "New password cannot be the same as your current password.",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser || !authUser.email) {
        throw new Error("Unable to identify current authenticated user.");
      }

      // Step 1: Verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authUser.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect. Please check your credentials and try again.");
      }

      // Step 2: Update password in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Step 3: Send security alert notification to user
      try {
        await notificationService.createNotification(
          authUser.id,
          "Security Alert: Password Changed",
          "Your account password was updated successfully. If you did not authorize this change, please contact support immediately."
        );
      } catch (notifErr) {
        console.warn("Could not dispatch password change notification:", notifErr);
      }

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Password Updated Successfully",
        description: "Your security credentials have been updated.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: err.message || "Failed to update password.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push("/login");
  };

  // Password strength checks
  const passwordCriteria = {
    length: newPassword.length >= 8,
    hasLetter: /[a-zA-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    matches: newPassword.length > 0 && newPassword === confirmPassword,
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 pt-14 md:pt-0">
      {/* Header Profile Summary Card */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 relative"></div>
        <CardContent className="pt-0 relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 mb-4 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative w-24 h-24 rounded-full ring-4 ring-background overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 shadow-lg">
                {profilePictureUrl ? (
                  <Image
                    src={getProfilePictureUrl(profilePictureUrl, 96)}
                    alt="Profile Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-2xl">
                    {user?.first_name ? user.first_name[0] : user?.username?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {user?.first_name || user?.last_name
                      ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim()
                      : user?.username || "Account Holder"}
                  </h1>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                    Active Client
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full bg-muted/60 p-1">
          <TabsTrigger value="profile" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Profile Details</span>
            <span className="sm:hidden">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3">
            <Shield className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Security &amp; Password</span>
            <span className="sm:hidden">Security</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-3">
            <CreditCard className="h-4 w-4 flex-shrink-0" />
            <span>Accounts</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile Details */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your contact and identification details</CardDescription>
              </div>
              <Button
                variant={isEditing ? "ghost" : "outline"}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground block">Username</span>
                    <span className="font-semibold text-foreground">{user?.username}</span>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground block">Email Address</span>
                    <span className="font-semibold text-foreground">{user?.email}</span>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground block">Full Name</span>
                    <span className="font-semibold text-foreground">
                      {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Not specified"}
                    </span>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground block">Phone Number</span>
                    <span className="font-semibold text-foreground">{profile?.phone_number || "Not set"}</span>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground block">Residential Address</span>
                    <span className="font-semibold text-foreground">{profile?.address || "Not set"}</span>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground block">Date of Birth</span>
                    <span className="font-semibold text-foreground">{profile?.date_of_birth || "Not set"}</span>
                  </div>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="date_of_birth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Residential Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Street address, City, Country" rows={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormItem>
                      <FormLabel>Avatar Picture</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={profilePictureUrl || undefined}
                          onChange={(url) => setProfilePictureUrl(url)}
                          folder="profile-pictures"
                          tags={["profile", "avatar"]}
                          maxSize={5 * 1024 * 1024}
                          showPreview={true}
                          previewClassName="w-24 h-24 rounded-full"
                          onError={(uploadErr) => {
                            toast({
                              variant: "destructive",
                              title: "Upload Error",
                              description: uploadErr,
                            });
                          }}
                        />
                      </FormControl>
                    </FormItem>

                    <div className="flex gap-2 justify-end pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {form.formState.isSubmitting ? "Saving..." : "Save Profile Details"}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security & Password */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Change Password Card */}
            <div className="lg:col-span-7">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-emerald-600" />
                    <CardTitle>Change Password</CardTitle>
                  </div>
                  <CardDescription>
                    Ensure your account is using a strong, unique password to maintain digital banking security.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase text-muted-foreground">
                        Current Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase text-muted-foreground">
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 8 characters"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase text-muted-foreground">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password criteria checklist */}
                    <div className="p-3 bg-muted/40 rounded-lg space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {passwordCriteria.length ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className={passwordCriteria.length ? "text-emerald-700 dark:text-emerald-400 font-medium" : ""}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordCriteria.hasNumber ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className={passwordCriteria.hasNumber ? "text-emerald-700 dark:text-emerald-400 font-medium" : ""}>
                          Contains at least one number (0-9)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordCriteria.matches ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className={passwordCriteria.matches ? "text-emerald-700 dark:text-emerald-400 font-medium" : ""}>
                          Passwords match
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5"
                    >
                      {isChangingPassword ? "Verifying & Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Security Status Info Card */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    <CardTitle className="text-base">Account Security Status</CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Security safeguards active on your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground">Encrypted Authentication</h4>
                      <p className="text-muted-foreground mt-0.5">
                        Your credentials are protected with industry-standard bcrypt hash and SSL transport encryption.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground">Security Email Alerts</h4>
                      <p className="text-muted-foreground mt-0.5">
                        Whenever your password or profile credentials change, automated notifications are immediately dispatched to your verified email.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <Lock className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground">Transfer PIN Protection</h4>
                      <p className="text-muted-foreground mt-0.5">
                        High-value wire transfers and withdrawals require secondary PIN authorization.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </TabsContent>

        {/* Tab 3: Bank Accounts */}
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Bank Accounts</CardTitle>
              <CardDescription>All linked checking, savings, and investment accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  No accounts linked to this profile.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Account Number</TableHead>
                        <TableHead className="text-right">Current Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">#{account.id}</TableCell>
                          <TableCell>{account.account_type?.name || "Standard Checking"}</TableCell>
                          <TableCell className="font-mono">
                            •••• {account.account_number.slice(-4)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-700 dark:text-emerald-400">
                            ${parseFloat(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Profile() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
