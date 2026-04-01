import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../../../../../services/api";
import AuthShell from "../../../../../components/auth/AuthShell";
import { Button, Input, Label } from "../../../../../components/auth/Ui";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPassword() {
  const query = useQuery();
  const navigate = useNavigate();

  const [token, setToken] = useState(query.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!token.trim()) {
      toast.error("Reset token is required.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password should be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.post<{ message: string }>("/auth/password/reset", { token, newPassword });
      toast.success(data.message || "Password reset successful.");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Set a new password for your account."
      footer={
        <div className="flex items-center justify-between gap-3 text-sm">
          <Link to="/forgot-password" className="text-slate-600 hover:text-slate-900">
            Back
          </Link>
          <Link to="/" className="text-cyan-700 hover:text-cyan-800">
            Go to login
          </Link>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <Label>Reset token</Label>
          <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste token here" />
        </div>

        <div>
          <Label>New password</Label>
          <Input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            type="password"
            autoComplete="new-password"
          />
        </div>

        <div>
          <Label>Confirm password</Label>
          <Input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            type="password"
            autoComplete="new-password"
          />
        </div>

        <Button loading={loading} onClick={() => void onSubmit()}>
          Update password
        </Button>
      </div>
    </AuthShell>
  );
}

