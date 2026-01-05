import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userAPI } from "@/api/user";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";

// --- VALIDATION SCHEMAS ---
const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be 6+ chars"),
});

const Profile = () => {
  // 1. Destructure updateUser from useAuth
  const { user, updateUser } = useAuth(); 
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar);

  // 2. Fetch Fresh Profile Data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: userAPI.getProfile,
  });

  // Fallback to context user if fetch hasn't finished or failed
  const currentUser = profileData?.data?.user || user;

  // --- MUTATIONS ---
  const updateProfileMutation = useMutation({
    mutationFn: userAPI.updateProfile,
    onSuccess: (response) => {
      toast.success("Profile updated successfully!");
      
      // A. Invalidate Server State (Refetch profile query)
      queryClient.invalidateQueries(["profile"]);
      
      // B. Sync Client State (Critical Rule: Auth Sync)
      // Extract robustly: check for response.data.user
      const updatedUser = response?.data?.user;
      if (updatedUser) {
        updateUser(updatedUser); 
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: userAPI.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully!");
      passForm.reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to change password");
    },
  });

  // --- FORMS ---
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: { name: currentUser?.name || "" }, // Auto-fill with fresh data
  });

  const passForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // --- HANDLERS ---
  const onProfileSubmit = (values) => {
    // Critical Rule: File uploads must use FormData
    const formData = new FormData();
    formData.append("name", values.name);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    updateProfileMutation.mutate(formData);
  };

  const onPasswordSubmit = (values) => {
    changePasswordMutation.mutate(values);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-8 w-full md:w-auto">
          <TabsTrigger value="general">General Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* --- GENERAL TAB --- */}
        <TabsContent value="general">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Avatar Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Click to upload new image</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32 border-2 border-primary">
                  <AvatarImage src={preview} className="object-cover" />
                  <AvatarFallback className="text-4xl">{currentUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="relative w-full">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    id="avatar-upload"
                    onChange={handleFileChange}
                  />
                  <Button variant="outline" className="w-full" asChild>
                    <label htmlFor="avatar-upload" className="cursor-pointer flex items-center justify-center">
                      <Upload className="mr-2 h-4 w-4" /> Change Avatar
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Details Form */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input {...profileForm.register("name")} />
                    {profileForm.formState.errors.name && (
                      <p className="text-red-500 text-sm">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={currentUser?.email || ""} disabled className="bg-slate-100 opacity-75 cursor-not-allowed" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- SECURITY TAB --- */}
        <TabsContent value="security">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" {...passForm.register("oldPassword")} />
                  {passForm.formState.errors.oldPassword && (
                    <p className="text-red-500 text-sm">{passForm.formState.errors.oldPassword.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" {...passForm.register("newPassword")} />
                  {passForm.formState.errors.newPassword && (
                    <p className="text-red-500 text-sm">{passForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;