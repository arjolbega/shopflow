import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ShoppingBag, KeyRound } from "lucide-react";
import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { useToast } from "../../hooks/useToast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import axios from "axios";
import type { ApiError } from "../../types";

const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  two_fa_token: z.string().length(6, "Must be 6 digits").optional().or(z.literal(""))
});

type LoginForm = z.infer<typeof loginSchema>;

interface LocationState {
  from?: {
    pathname: string;
  };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { setAuth } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);

  // Redirect back to where they came from, or home
  const from = (location.state as LocationState)?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await authApi.login({
        email: data.email,
        password: data.password,
        two_fa_token: data.two_fa_token || undefined
      });

      if (result.requires2FA) {
        setRequires2FA(true);
        return;
      }

      setAuth(result.accessToken, result.user!);
      toast.success(`Welcome back, ${result.user!.first_name}!`);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ApiError;

        const code = data?.error?.code;
        const message = data?.error?.message || "Something went wrong";

        if (code === "VALIDATION_ERROR" && data.error.details) {
          Object.entries(data.error.details).forEach(([field, messages]) => {
            setError(field as keyof LoginForm, { message: messages[0] });
          });
        } else if (code === "INVALID_2FA_TOKEN") {
          setError("two_fa_token", { message });
        } else {
          setError("root", { message });
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel (decorative) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-surface border-r border-border flex-col items-center justify-center p-12">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_8px_32px_rgba(245,158,11,0.3)]">
            <ShoppingBag size={28} className="text-bg-base" />
          </div>
          <h2 className="text-3xl font-bold text-text-primary mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Welcome back to ShopFlow
          </h2>
          <p className="text-text-secondary leading-relaxed">Sign in to access your orders, wishlist, and a curated shopping experience.</p>

          {/* Decorative cards */}
          <div className="mt-10 flex flex-col gap-3">
            {[
              { label: "Free shipping", desc: "On orders over $50" },
              { label: "Easy returns", desc: "30-day return policy" },
              { label: "Secure checkout", desc: "Powered by Stripe" }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 px-5 py-4 bg-bg-elevated rounded-xl border border-border text-left">
                <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{item.label}</p>
                  <p className="text-xs text-text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {requires2FA ? "Two-Factor Auth" : "Sign in"}
            </h1>
            <p className="text-sm text-text-secondary">
              {requires2FA ? (
                "Enter the 6-digit code from your authenticator app"
              ) : (
                <>
                  Don't have an account?{" "}
                  <Link to="/register" className="text-accent hover:text-accent-hover underline underline-offset-4 transition-colors">
                    Sign up
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Root error */}
            {errors.root && <div className="px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">{errors.root.message}</div>}

            {!requires2FA ? (
              <>
                <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} autoComplete="email" {...register("email")} />

                <div className="flex flex-col gap-1.5">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    error={errors.password?.message}
                    autoComplete="current-password"
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword((p) => !p)} className="cursor-pointer hover:text-text-primary transition-colors">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                    {...register("password")}
                  />
                  <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-xs text-text-muted hover:text-accent transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 bg-accent-muted border border-border-accent rounded-2xl flex items-center justify-center">
                  <KeyRound size={24} className="text-accent" />
                </div>
                <Input label="6-digit code" type="text" inputMode="numeric" maxLength={6} placeholder="000000" error={errors.two_fa_token?.message} className="text-center text-2xl tracking-[0.5em] font-mono" autoComplete="one-time-code" autoFocus {...register("two_fa_token")} />
              </div>
            )}

            <Button type="submit" variant="accent" fullWidth isLoading={isSubmitting} className="mt-2">
              {requires2FA ? "Verify" : "Sign in"}
            </Button>

            {requires2FA && (
              <button type="button" onClick={() => setRequires2FA(false)} className="text-sm text-text-muted hover:text-text-primary transition-colors text-center cursor-pointer">
                ← Back to login
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
