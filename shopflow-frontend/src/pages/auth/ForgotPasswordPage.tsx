import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { authApi } from "../../api/auth.api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const schema = z.object({
  email: z.email("Invalid email")
});

type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotForm>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: ForgotForm) => {
    await authApi.forgotPassword(data.email);
    // Always show success — backend never reveals if email exists
    setSentEmail(data.email);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-success" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Check your email
          </h1>
          <p className="text-text-secondary mb-2">
            If an account exists for <span className="text-accent">{sentEmail}</span>, we've sent a password reset link.
          </p>
          <p className="text-sm text-text-muted mb-8">The link expires in 30 minutes.</p>
          <Link to="/login">
            <Button variant="ghost" fullWidth leftIcon={<ArrowLeft size={16} />}>
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-12 h-12 bg-accent-muted border border-border-accent rounded-xl flex items-center justify-center mb-6">
            <Mail size={20} className="text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Forgot password?
          </h1>
          <p className="text-sm text-text-secondary">Enter your email and we'll send you a reset link.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} autoComplete="email" autoFocus {...register("email")} />

          <Button type="submit" variant="accent" fullWidth isLoading={isSubmitting}>
            Send reset link
          </Button>

          <Link to="/login">
            <Button variant="ghost" fullWidth leftIcon={<ArrowLeft size={16} />}>
              Back to Sign In
            </Button>
          </Link>
        </form>
      </div>
    </div>
  );
}
