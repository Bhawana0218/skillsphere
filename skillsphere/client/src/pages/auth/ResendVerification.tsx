import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../services/api";
import AuthShell from "../../components/auth/AuthShell";
import { Button, Input, Label } from "../../components/auth/Ui";

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    setLoading(true);
    setDevToken(null);
    try {
      const { data } = await API.post<{ message: string; verificationToken?: string }>(
        "/auth/resend-verification",
        { email }
      );
      toast.success(data.message || "Verification email sent.");
      setDevToken(data.verificationToken ?? null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Resend verification"
      subtitle="We’ll send a new verification link to your email."
      footer={
        <div className="flex items-center justify-between gap-3 text-sm">
          <Link to="/" className="text-slate-600 hover:text-slate-900">
            Back to login
          </Link>
          <Link to="/verify-email" className="text-cyan-700 hover:text-cyan-800">
            Have a token? Verify now
          </Link>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <Label>Email</Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            type="email"
            autoComplete="email"
          />
        </div>

        <Button loading={loading} onClick={() => void onSubmit()}>
          Send verification email
        </Button>

        {devToken ? (
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="text-xs font-semibold text-slate-700">Dev token (SMTP not configured)</div>
            <div className="mt-2 break-all rounded-xl bg-white p-3 text-xs text-slate-800 ring-1 ring-slate-200">
              {devToken}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(devToken);
                  toast.success("Token copied.");
                }}
              >
                Copy token
              </Button>
              <Link to={`/verify-email?token=${encodeURIComponent(devToken)}`}>
                <Button variant="primary">Open verify page</Button>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </AuthShell>
  );
}

