import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import API from "../../../services/api";
import { Button, Input, Label } from "../../../components/auth/Ui";

type Enable2faResponse = {
  message: string;
  otpauthUrl: string;
  twoFactorSecret?: string;
};

function maskSecret(secret: string) {
  if (!secret) return "";
  if (secret.length <= 8) return secret;
  return `${secret.slice(0, 4)}…${secret.slice(-4)}`;
}

export default function TwoFactorSetup() {
  const [loading, setLoading] = useState(false);
  const [otpauthUrl, setOtpauthUrl] = useState<string>("");
  const [twoFactorSecret, setTwoFactorSecret] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [confirming, setConfirming] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const userEmail = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null") as { email?: string } | null;
      return user?.email || "";
    } catch {
      return "";
    }
  }, []);

  const generate = async () => {
    setLoading(true);
    setEnabled(false);
    setCode("");
    try {
      const { data } = await API.post<Enable2faResponse>("/auth/2fa/enable");
      setOtpauthUrl(data.otpauthUrl);
      setTwoFactorSecret(data.twoFactorSecret || "");
      toast.success("2FA secret generated. Scan the QR and confirm.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate 2FA secret.");
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!code.trim()) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setConfirming(true);
    try {
      const { data } = await API.post<{ message: string }>("/auth/2fa/confirm", { code });
      toast.success(data.message || "2FA enabled.");
      setEnabled(true);
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "null") as any;
        if (stored) {
          stored.twoFactorEnabled = true;
          localStorage.setItem("user", JSON.stringify(stored));
        }
      } catch {
        // ignore
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid code.");
      setEnabled(false);
    } finally {
      setConfirming(false);
    }
  };

  useEffect(() => {
    //auto generate on first time visit
    void generate();
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <div className="text-2xl mt-8 font-semibold">Security</div>
        <div className="mt-2 text-sm text-white/70">
          Enable Two-Factor Authentication (2FA) to protect your SkillSphere account.
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="text-sm font-semibold">Step 1 — Scan QR</div>
          <div className="mt-2 text-sm text-white/70">
            Use Google Authenticator, Microsoft Authenticator, or Authy. Account:{" "}
            <span className="font-medium text-white">{userEmail || "your email"}</span>
          </div>

          <div className="mt-5 grid place-items-center rounded-2xl bg-black/20 p-5 ring-1 ring-white/10">
            {otpauthUrl ? (
              <QRCodeCanvas value={otpauthUrl} size={200} bgColor="#0B1020" fgColor="#E5E7EB" includeMargin />
            ) : (
              <div className="text-sm text-white/60">Generating QR…</div>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="text-xs font-semibold text-white/80">Manual setup key</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-white">{maskSecret(twoFactorSecret)}</div>
              <Button
                variant="secondary"
                className="h-10 w-auto"
                disabled={!twoFactorSecret}
                onClick={async () => {
                  if (!twoFactorSecret) return;
                  await navigator.clipboard.writeText(twoFactorSecret);
                  toast.success("Secret copied.");
                }}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="mt-4">
            <Button variant="ghost" loading={loading} onClick={() => void generate()}>
              Regenerate secret
            </Button>
          </div>
        </div>

        <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="text-sm font-semibold">Step 2 — Confirm code</div>
          <div className="mt-2 text-sm text-white/70">
            Enter the current 6-digit code from your authenticator app to enable 2FA.
          </div>

          <div className="mt-5">
            <Label>6-digit code</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>

          <div className="mt-4 grid gap-3">
            <Button loading={confirming} onClick={() => void confirm()}>
              Enable 2FA
            </Button>
            <div
              className={`rounded-2xl p-4 ring-1 ${
                enabled ? "bg-emerald-500/10 ring-emerald-400/20" : "bg-white/5 ring-white/10"
              }`}
            >
              <div className="text-sm font-semibold">{enabled ? "2FA is enabled" : "Not enabled yet"}</div>
              <div className="mt-1 text-sm text-white/70">
                {enabled
                  ? "Next login will require your authenticator code."
                  : "Scan the QR, then confirm with a valid code."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

