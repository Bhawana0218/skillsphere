import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../../../components/auth/AuthShell";
import { Button } from "../../../components/auth/Ui";

export default function VerifyRequired() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    toast.success("Logged out.");
    navigate("/");
  };

  return (
    <AuthShell
      title="Verify your email to continue"
      subtitle="For security and trusted collaboration, please verify your email before accessing your dashboard."
      footer={
        <div className="flex items-center justify-between gap-3 text-sm">
          <Link to="/resend-verification" className="text-slate-600 hover:text-slate-900">
            Resend verification email
          </Link>
          <Link to="/verify-email" className="text-cyan-700 hover:text-cyan-800">
            Enter token
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">Why this is required</div>
          <div className="mt-1 text-sm text-slate-600">
            Verified email helps prevent abuse, protects payments, and improves trust across the platform.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link to="/resend-verification">
            <Button variant="secondary" type="button">
              Resend email
            </Button>
          </Link>
          <Link to="/verify-email">
            <Button type="button">Verify now</Button>
          </Link>
        </div>

        <Button variant="ghost" type="button" onClick={logout}>
          Log out
        </Button>
      </div>
    </AuthShell>
  );
}

