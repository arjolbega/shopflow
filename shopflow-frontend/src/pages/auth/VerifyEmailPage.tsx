import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { authApi } from "../../api/auth.api";
import Button from "../../components/ui/Button";
import axios from "axios";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Initialize status based on token presence — no effect needed for this
  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");
  const [errorMessage, setErrorMessage] = useState(token ? "" : "No verification token found in the URL.");

  useEffect(() => {
    // Only run if token exists — status already set to 'error' if not
    if (!token) return;

    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        if (axios.isAxiosError(err)) {
          setErrorMessage(err.response?.data?.error?.message || "Verification failed");
        }
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="w-20 h-20 bg-bg-elevated border border-border rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader size={32} className="text-accent animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Verifying your email...
            </h1>
            <p className="text-text-secondary">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} className="text-success" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Email verified!
            </h1>
            <p className="text-text-secondary mb-8">Your account is now active. You can sign in and start shopping.</p>
            <Button variant="accent" fullWidth>
              <Link to="/login">Go to Sign In</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-error/10 border border-error/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={36} className="text-error" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Verification failed
            </h1>
            <p className="text-text-secondary mb-2">{errorMessage}</p>
            <p className="text-sm text-text-muted mb-8">The link may have expired or already been used.</p>
            <div className="flex flex-col gap-3">
              <Link to="/login">
                <Button variant="accent" fullWidth>
                  Go to Sign In
                </Button>
              </Link>
              <Link to="/register" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                Create a new account
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
