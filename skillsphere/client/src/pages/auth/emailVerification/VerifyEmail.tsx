import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../../services/api";
import AuthShell from "../../../components/auth/AuthShell";
import { Button, Input, Label } from "../../../components/auth/Ui";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function VerifyEmail() {
  const query = useQuery();
  const navigate = useNavigate();

  const [token, setToken] = useState<string>(query.get("token") || "");
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const verify = async (t: string) => {
    if (!t.trim()) {
      toast.error("Verification token is required.");
      return;
    }
    setStatus("verifying");
    setMessage("");
    try {
      const { data } = await API.get<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(t)}`);
      setStatus("success");
      setMessage(data.message || "Email verified.");
      toast.success("Email verified. You can log in now.");
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "null") as any;
        if (stored) {
          stored.isVerified = true;
          localStorage.setItem("user", JSON.stringify(stored));
        }
      } catch {
        // ignore
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Verification failed.");
      toast.error(err.response?.data?.message || "Verification failed.");
    }
  };

  useEffect(() => {
    if (query.get("token")) {
      void verify(query.get("token") || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Confirm your email to unlock secure features and trusted collaboration."
      footer={
        <div className="flex items-center justify-between gap-3 text-sm">
          <Link to="/" className="text-slate-600 hover:text-slate-900">
            Back to login
          </Link>
          <Link to="/resend-verification" className="text-cyan-700 hover:text-cyan-800">
            Resend verification
          </Link>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">Status</div>
          <div className="mt-1 text-sm text-slate-600">
            {status === "idle" ? "Paste your token or open the link from your email." : null}
            {status === "verifying" ? "Verifying your email…" : null}
            {status === "success" ? message : null}
            {status === "error" ? message : null}
          </div>
        </div>

        <div>
          <Label>Verification token</Label>
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste token here"
            autoComplete="off"
          />
        </div>

        <div className="grid gap-3">
          <Button loading={status === "verifying"} onClick={() => void verify(token)}>
            Verify email
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              navigate("/");
            }}
          >
            Go to login
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}

