import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useForgotPassword, useResetPassword } from "@/hooks/useAuthMutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, KeyRound, CheckCircle } from "lucide-react";

// Schema for Step 1
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Schema for Step 2 (Dynamic answers validated manually or loosely here)
const resetSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: Questions
  const [email, setEmail] = useState("");
  const [questions, setQuestions] = useState([]); // Array of { id, question }

  // Hooks
  const { mutate: getQuestions, isPending: isLoadingQuestions } = useForgotPassword();
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword();

  // Forms
  const emailForm = useForm({ resolver: zodResolver(emailSchema) });
  const resetForm = useForm({ resolver: zodResolver(resetSchema) });

  // --- HANDLERS ---

  const onEmailSubmit = (data) => {
    getQuestions(data.email, {
      onSuccess: (response) => {
        // Backend returns: { questions: [ { id: 1, question: "Pet?" }, ... ] }
        const qList = response?.questions || [];
        if (qList.length === 0) {
           // If backend returns empty array (user hasn't set up questions)
           alert("No security questions set for this account. Contact Admin.");
           return;
        }
        setQuestions(qList);
        setEmail(data.email);
        setStep(2);
      }
    });
  };

  const onResetSubmit = (data) => {
    // Collect answers from DOM or Form State
    // Since questions are dynamic, we used raw inputs below, let's gather them:
    const answers = {};
    questions.forEach(q => {
      const val = document.getElementById(`q-${q.id}`).value;
      answers[q.id] = val;
    });

    resetPassword({
      email,
      newPassword: data.newPassword,
      answers // { "1": "Fido", "2": "Kathmandu" }
    }, {
      onSuccess: () => {
        navigate("/login");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="h2 text-2xl">Account Recovery</CardTitle>
          <CardDescription className="p1">
            {step === 1 ? "Enter your email to find your account." : "Answer security questions to reset password."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input {...emailForm.register("email")} placeholder="user@example.com" />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoadingQuestions}>
                {isLoadingQuestions ? <Loader2 className="animate-spin h-4 w-4" /> : "Continue"}
              </Button>
            </form>
          )}

          {/* STEP 2: QUESTIONS & NEW PASSWORD */}
          {step === 2 && (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
              
              {/* Dynamic Questions */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-md border">
                {questions.map((q) => (
                  <div key={q.id} className="space-y-1">
                    <Label htmlFor={`q-${q.id}`} className="text-xs uppercase text-muted-foreground font-bold">
                      {q.question}
                    </Label>
                    <Input id={`q-${q.id}`} required placeholder="Your answer..." />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password" 
                  {...resetForm.register("newPassword")} 
                  placeholder="Minimum 6 characters" 
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="text-sm text-red-500">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isResetting}>
                {isResetting ? <Loader2 className="animate-spin h-4 w-4" /> : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Button variant="link" onClick={() => navigate("/login")} className="text-sm text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;