import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form"; // 👈 Import Controller
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { 
  useProfile, 
  useUpdateProfile, 
  useChangePassword, 
  useSetupSecurityQuestions 
} from "@/hooks/useUser";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, Plus, Trash2 } from "lucide-react";

// --- PRE-DEFINED QUESTIONS (Fixed List) ---
const SECURITY_QUESTIONS = [
  "What is the name of your first pet?",
  "In what city were you born?",
  "What is your mother's maiden name?",
  "What was the make of your first car?",
  "What is your favorite food?",
  "What is the name of your elementary school?"
];

// --- VALIDATION SCHEMAS ---
const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be 6+ chars"),
});

const securityQuestionsSchema = z.object({
  currentPassword: z.string().min(1, "Password required to save changes"),
  questions: z.array(z.object({
    question: z.string().min(1, "Please select a question"),
    answer: z.string().min(1, "Answer is required")
  })).min(3, "Please set up at least 3 questions for better security") // 👈 Enforce 3 questions
});

const Profile = () => {
  const { user } = useAuth();
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(user?.avatar);

  // Hooks
  const { data: profileData, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { mutate: setupQuestions, isPending: isSettingQuestions } = useSetupSecurityQuestions();

  const currentUser = profileData?.data?.user || user;

  // Forms
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: { name: currentUser?.name || "" },
  });

  const passForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const questionForm = useForm({
    resolver: zodResolver(securityQuestionsSchema),
    defaultValues: {
      questions: [
        { question: SECURITY_QUESTIONS[0], answer: "" },
        { question: SECURITY_QUESTIONS[1], answer: "" },
        { question: SECURITY_QUESTIONS[2], answer: "" }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: questionForm.control,
    name: "questions"
  });

  // Handlers
  const onProfileSubmit = (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    if (avatarFile) formData.append("avatar", avatarFile);
    updateProfile(formData);
  };

  const onPasswordSubmit = (values) => {
    changePassword(values, { onSuccess: () => passForm.reset() });
  };

  const onQuestionsSubmit = (values) => {
    setupQuestions(values, {
      onSuccess: () => questionForm.resetField("currentPassword")
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  if (isLoading) return <div className="flex h-[50vh] justify-center items-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="h1 mb-8">Account Settings</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-8 w-full md:w-auto">
          <TabsTrigger value="general">General Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* --- GENERAL TAB --- */}
        <TabsContent value="general">
           {/* ... (Same as before) ... */}
           <div className="grid gap-8 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="h2">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32 border-2 border-primary">
                  <AvatarImage src={preview} className="object-cover" />
                  <AvatarFallback className="text-4xl">{currentUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="relative w-full">
                  <Input type="file" accept="image/*" className="hidden" id="avatar-upload" onChange={handleFileChange} />
                  <Button variant="outline" className="w-full" asChild>
                    <label htmlFor="avatar-upload" className="cursor-pointer flex items-center justify-center">
                      <Upload className="mr-2 h-4 w-4" /> Change Avatar
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="h2">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input {...profileForm.register("name")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={currentUser?.email || ""} disabled className="bg-slate-100 opacity-75" />
                  </div>
                  <Button type="submit" disabled={isUpdatingProfile}>
                    {isUpdatingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- SECURITY TAB --- */}
        <TabsContent value="security" className="space-y-6">
          
          {/* Change Password */}
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="h2">Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={passForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" {...passForm.register("oldPassword")} />
                    {passForm.formState.errors.oldPassword && <p className="text-red-500 text-sm">{passForm.formState.errors.oldPassword.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" {...passForm.register("newPassword")} />
                    {passForm.formState.errors.newPassword && <p className="text-red-500 text-sm">{passForm.formState.errors.newPassword.message}</p>}
                  </div>
                </div>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Questions (FIXED DROPDOWNS) */}
          <Card className="max-w-2xl border-orange-200">
            <CardHeader className="bg-orange-50/50">
              <CardTitle className="h2 text-orange-900">Security Questions</CardTitle>
              <CardDescription className="p1">
                Select 3 questions to secure your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={questionForm.handleSubmit(onQuestionsSubmit)} className="space-y-6">
                
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 bg-slate-50 rounded-lg border relative">
                      <div className="grid gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-muted-foreground uppercase">Question {index + 1}</Label>
                          
                          {/* 🛠️ FIX: Use Controller for Shadcn Select */}
                          <Controller
                            control={questionForm.control}
                            name={`questions.${index}.question`}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select a question" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SECURITY_QUESTIONS.map((q) => (
                                    <SelectItem key={q} value={q}>
                                      {q}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-bold text-muted-foreground uppercase">Answer</Label>
                          <Input 
                            type="password"
                            placeholder="Your answer..." 
                            {...questionForm.register(`questions.${index}.answer`)} 
                          />
                        </div>
                      </div>
                      
                      {/* Allow remove only if > 3 (To enforce security) */}
                      {fields.length > 3 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 text-red-500"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                   {fields.length < 5 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => append({ question: SECURITY_QUESTIONS[0], answer: "" })}
                        className="w-full border-dashed"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Question
                      </Button>
                   )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Verify Password to Save</Label>
                  <Input 
                    type="password" 
                    placeholder="Enter current password to confirm" 
                    {...questionForm.register("currentPassword")} 
                  />
                  {questionForm.formState.errors.currentPassword && (
                    <p className="text-red-500 text-sm">{questionForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isSettingQuestions} className="w-full">
                  {isSettingQuestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Security Questions"}
                </Button>
              </form>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;