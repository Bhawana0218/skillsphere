import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

type StoredUser = {
  email?: string;
  isVerified?: boolean;
  twoFactorEnabled?: boolean;
};

function readUser(): StoredUser | null {
  try {
    return JSON.parse(localStorage.getItem("user") || "null") as StoredUser | null;
  } catch {
    return null;
  }
}

export default function AccountStatusBanner() {
  const token = localStorage.getItem("token");
  const user = readUser();

  if (!token || !user) return null;

  const showVerify = user.isVerified === false;
  const show2fa = user.twoFactorEnabled === false;
  const showGoogleMissing = !import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!showVerify && !show2fa && !showGoogleMissing) return null;

  const resend = async () => {
    try {
      await API.post("/auth/resend-verification", { email: user.email });
      toast.success("Verification email sent.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend.");
    }
  };

  return (
    <div className="mx-auto mb-4 max-w-6xl rounded-2xl bg-linear-to-r from-cyan-500/10 via-white/5 to-indigo-500/10 p-4 ring-1 ring-white/10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-white/80">
          <span className="font-semibold text-white">Account status:</span>{" "}
          {showVerify ? (
            <span className="text-cyan-200">Email not verified</span>
          ) : (
            <span className="text-emerald-200">Email verified</span>
          )}
          {" • "}
          {show2fa ? (
            <span className="text-cyan-200">2FA not enabled</span>
          ) : (
            <span className="text-emerald-200">2FA enabled</span>
          )}
          {showGoogleMissing ? (
            <>
              {" • "}
              <span className="text-amber-200">Google OAuth not configured</span>
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {showVerify ? (
            <>
              <Link
                to="/verify-email"
                className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
              >
                Verify now
              </Link>
              <button
                onClick={() => void resend()}
                className="rounded-xl bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-100 ring-1 ring-cyan-300/20 hover:bg-cyan-500/25"
              >
                Resend email
              </button>
            </>
          ) : null}

          {show2fa ? (
            <Link
              to="/settings/security"
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            >
              Enable 2FA
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

