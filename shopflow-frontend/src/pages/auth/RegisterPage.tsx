import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ShoppingBag, CheckCircle } from "lucide-react";
import { authApi } from "../../api/auth.api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { cn } from "../../utils/cn";
import axios from "axios";
import type { ApiError } from "../../types";

const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required").max(100),
    last_name: z.string().min(1, "Last name is required").max(100),
    email: z.email("Invalid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .max(100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain uppercase, lowercase and number"),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  });

  const password = watch("password", "");

  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Number", valid: /\d/.test(password) }
  ];

  const onSubmit = async (data: RegisterForm) => {
    try {
      await authApi.register({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password
      });
      setRegisteredEmail(data.email);
      setRegistered(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const errData = err.response?.data as ApiError;
        const code = errData?.error?.code;
        const message = errData?.error?.message || "Something went wrong";

        if (code === "EMAIL_TAKEN") {
          setError("email", { message: "This email is already in use" });
        } else if (code === "VALIDATION_ERROR" && errData.error.details) {
          Object.entries(errData.error.details).forEach(([field, messages]) => {
            setError(field as keyof RegisterForm, { message: messages[0] });
          });
        } else {
          setError("root", { message });
        }
      }
    }
  };

  // ── Success state ──────────────────────────────────
  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-success" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Check your inbox
          </h1>
          <p className="text-text-secondary mb-2 leading-relaxed">We sent a verification link to</p>
          <p className="text-accent font-medium mb-6">{registeredEmail}</p>
          <p className="text-sm text-text-muted mb-8">Click the link to activate your account. The link expires in 60 minutes.</p>
          <div className="flex flex-col gap-3">
            <Button variant="accent" fullWidth onClick={() => navigate("/login")}>
              Go to Sign In
            </Button>
            <button
              onClick={async () => {
                await authApi.resendVerification(registeredEmail);
              }}
              className="text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              Didn't receive it? Resend email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-surface border-r border-border flex-col items-center justify-center p-12">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(245,158,11,0.3)]">
            <ShoppingBag size={28} className="text-bg-base" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Join ShopFlow today
          </h2>
          <p className="text-text-secondary leading-relaxed">Create an account to unlock your personal wishlist, order tracking, and exclusive member deals.</p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Create account
            </h1>
            <p className="text-sm text-text-secondary">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:text-accent-hover underline underline-offset-4 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {errors.root && <div className="px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">{errors.root.message}</div>}

            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" placeholder="John" error={errors.first_name?.message} autoComplete="given-name" {...register("first_name")} />
              <Input label="Last name" placeholder="Doe" error={errors.last_name?.message} autoComplete="family-name" {...register("last_name")} />
            </div>

            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} autoComplete="email" {...register("email")} />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              error={errors.password?.message}
              autoComplete="new-password"
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
              Create account
            </Button>

            <p className="text-xs text-text-muted text-center">
              By creating an account you agree to our{" "}
              <a href="#" className="text-text-secondary hover:text-text-primary underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-text-secondary hover:text-text-primary underline">
                Privacy Policy
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
