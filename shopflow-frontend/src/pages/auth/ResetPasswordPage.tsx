import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { authApi } from "../../api/auth.api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { cn } from "../../utils/cn";
import axios from "axios";
import type { ApiError } from "../../types";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain uppercase, lowercase and number"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

type ResetForm = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ResetForm>({
    resolver: zodResolver(schema)
  });

  const password = watch("password", "");

  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Number", valid: /\d/.test(password) }
  ];

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      setError("root", { message: "Invalid reset link — please request a new one" });
      return;
    }

    try {
      await authApi.resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errData = err.response?.data as ApiError;
        setError("root", {
          message: errData?.error?.message || "Reset failed — link may have expired"
        });
      }
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-error mb-4">Invalid reset link.</p>
          <Link to="/forgot-password">
            <Button variant="accent">Request new link</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-success" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Password reset!
          </h1>
          <p className="text-text-secondary mb-2">Your password has been updated successfully.</p>
          <p className="text-sm text-text-muted">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-12 h-12 bg-accent-muted border border-border-accent rounded-xl flex items-center justify-center mb-6">
            <Lock size={20} className="text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Reset password
          </h1>
          <p className="text-sm text-text-secondary">Choose a strong new password.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {errors.root && <div className="px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">{errors.root.message}</div>}

          <Input
            label="New password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            error={errors.password?.message}
            autoComplete="new-password"
            autoFocus
            rightIcon={
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="cursor-pointer hover:text-text-primary transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            {...register("password")}
          />

          {/* Password strength */}
          {password.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {passwordChecks.map((check) => (
                <div key={check.label} className={cn("flex items-center gap-1.5 text-xs transition-colors", check.valid ? "text-success" : "text-text-muted")}>
                  <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", check.valid ? "bg-success" : "bg-text-muted")} />
                  {check.label}
                </div>
              ))}
            </div>
          )}

          <Input label="Confirm password" type={showPassword ? "text" : "password"} placeholder="Repeat your password" error={errors.confirmPassword?.message} autoComplete="new-password" {...register("confirmPassword")} />

          <Button type="submit" variant="accent" fullWidth isLoading={isSubmitting} className="mt-2">
            Reset password
          </Button>
        </form>
      </div>
    </div>
  );
}
