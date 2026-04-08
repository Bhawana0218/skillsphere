import { useEffect, useMemo, useState, useRef } from "react";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import API from "../../../services/api";

type Enable2faResponse = {
  message: string;
  otpauthUrl: string;
  twoFactorSecret?: string;
};

function maskSecret(secret: string) {
  if (!secret) return "";
  if (secret.length <= 8) return secret;
  return `${secret.slice(0, 4)}••••${secret.slice(-4)}`;
}

// OTP Input Component with auto-advance
function OtpInput({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: string; 
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  
  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    
    const newValue = value.split("");
    newValue[index] = val.slice(-1);
    const updated = newValue.join("");
    onChange(updated);
    
    // Auto-advance to next input
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      onChange(pasted);
      inputsRef.current[5]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {[...Array(6)].map((_, index) => (
        <input
          key={index}
          ref={(el) => {
                inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 ${
            disabled
              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              : value[index]
              ? "bg-cyan-50 border-cyan-400 text-cyan-700 shadow-sm shadow-cyan-500/20"
              : "bg-white border-gray-200 text-gray-800 hover:border-cyan-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20"
          }`}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

// Animated Check Icon
function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

// Shield Icon
function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

export default function TwoFactorSetup() {
  const [loading, setLoading] = useState(false);
  const [otpauthUrl, setOtpauthUrl] = useState<string>("");
  const [twoFactorSecret, setTwoFactorSecret] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [confirming, setConfirming] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasShownToast = useRef(false);

  const userEmail = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null") as { email?: string } | null;
      return user?.email || "";
    } catch {
      return "";
    }
  }, []);
  const hasGenerated = useRef(false);

useEffect(() => {
  if (hasGenerated.current) return;
  hasGenerated.current = true;

  void generate();
}, []);

  const generate = async () => {
    setLoading(true);
    setEnabled(false);
    setCode("");
    try {
      const { data } = await API.post<Enable2faResponse>("/auth/2fa/enable");
      setOtpauthUrl(data.otpauthUrl);
      setTwoFactorSecret(data.twoFactorSecret || "");
      if (!hasGenerated.current) {
      toast.success(" 2FA secret generated! Scan the QR code to continue.");
       hasShownToast.current = true;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to generate 2FA secret.");
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!code.trim() || code.length !== 6) {
      toast.error("Please enter a valid 6-digit code from your authenticator app.");
      return;
    }
    setConfirming(true);
    try {
      const { data:_ } = await API.post<{ message: string }>("/auth/2fa/confirm", { code });
      toast.success(" Two-factor authentication enabled successfully!");
      setEnabled(true);
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "null") as any;
        if (stored) {
          stored.twoFactorEnabled = true;
          localStorage.setItem("user", JSON.stringify(stored));
        }
      } catch {
        // ignore storage errors
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid code. Please try again.");
      setCode("");
      setEnabled(false);
    } finally {
      setConfirming(false);
    }
  };

  const copySecret = async () => {
    if (!twoFactorSecret) return;
    try {
      await navigator.clipboard.writeText(twoFactorSecret);
      setCopied(true);
      toast.success("📋 Secret key copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Please select and copy manually.");
    }
  };

  const handleRegenerate = () => {
    if (window.confirm("Regenerating will invalidate your current QR code. Continue?")) {
      void generate();
    }
  };

  useEffect(() => {
    void generate();
  }, []);

  // Progress calculation
  const progress = useMemo(() => {
    let steps = 0;
    if (otpauthUrl) steps += 33;
    if (code.length === 6) steps += 33;
    if (enabled) steps += 34;
    return steps;
  }, [otpauthUrl, code, enabled]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-cyan-50/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h1>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Setup Progress</span>
            <span className="text-sm font-bold text-cyan-600">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>Generate</span>
            <span>Scan</span>
            <span>Verify</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Security Banner */}
        <div className="mb-8 bg-cyan-600 rounded-2xl p-5 text-white shadow-lg shadow-cyan-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Why enable 2FA?</h3>
              <p className="text-sm text-cyan-100 mt-1">
                Even if someone gets your password, they can't access your account without your authenticator app. 
                Recommended by security experts worldwide.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Step 1: QR Code Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-cyan-200 transition-all duration-300">
            <div className="p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Scan QR Code</h2>
                  <p className="text-sm text-gray-500">Use your authenticator app</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Account Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-semibold">
                  {userEmail?.charAt(0).toUpperCase() || "👤"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Account</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{userEmail || "your email"}</p>
                </div>
                <span className="ml-auto px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Verified
                </span>
              </div>

              {/* QR Code Display */}
              <div className="flex flex-col items-center">
                <div className={`relative p-4 rounded-2xl transition-all duration-300 ${
                  otpauthUrl 
                    ? "bg-linear-to-br from-gray-900 to-gray-800 shadow-2xl shadow-cyan-500/10" 
                    : "bg-gray-100"
                }`}>
                  {loading ? (
                    <div className="w-48 h-48 flex items-center justify-center">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-cyan-200 rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-cyan-500 rounded-full animate-ping opacity-20" />
                      </div>
                    </div>
                  ) : otpauthUrl ? (
                    <div className="relative group">
                      <QRCodeCanvas 
                        value={otpauthUrl} 
                        size={192} 
                        bgColor="#0B1020" 
                        fgColor="#FFFFFF" 
                        level="H"
                        includeMargin 
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-gray-900/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-gray-400 text-sm">
                      Generating...
                    </div>
                  )}
                </div>
                
                {/* Supported Apps */}
                <div className="flex items-center gap-3 mt-4">
                  {["Google", "Microsoft", "Authy"].map((app) => (
                    <span key={app} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                      {app} Authenticator
                    </span>
                  ))}
                </div>
              </div>

              {/* Manual Setup Key */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-700">Manual setup key</span>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
                  >
                    {showSecret ? "Hide" : "Show"}
                    <svg className={`w-4 h-4 transition-transform ${showSecret ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <code className={`flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-mono tracking-wider transition-all ${
                    showSecret ? "text-gray-800" : "text-gray-400"
                  }`}>
                    {showSecret ? twoFactorSecret : maskSecret(twoFactorSecret)}
                  </code>
                  <button
                    type="button"
                    onClick={copySecret}
                    disabled={!twoFactorSecret}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      copied
                        ? "bg-green-100 text-green-600"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Regenerate Button */}
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate Secret
              </button>
            </div>
          </div>

          {/* Step 2: Verification Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-cyan-200 transition-all duration-300">
            <div className="p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                  enabled ? "bg-green-500" : "bg-blue-500"
                }`}>
                  2
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Verify & Enable</h2>
                  <p className="text-sm text-gray-500">Enter the code from your app</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-800">
                    Open your authenticator app and enter the <strong>6-digit code</strong> currently displayed for your account. Codes refresh every 30 seconds.
                  </p>
                </div>
              </div>

              {/* OTP Input */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Authentication Code
                </label>
                <OtpInput 
                  value={code} 
                  onChange={setCode} 
                  disabled={confirming || enabled} 
                />
                <p className="text-xs text-gray-400 text-center">
                  Code expires in <span className="text-cyan-600 font-medium">30 seconds</span>
                </p>
              </div>

              {/* Enable Button */}
              <button
                type="button"
                onClick={() => void confirm()}
                disabled={confirming || enabled || code.length !== 6}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-2xl transition-all duration-200 shadow-md ${
                  enabled
                    ? "bg-green-500 text-white cursor-default"
                    : confirming || code.length !== 6
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-linear-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 hover:shadow-lg hover:shadow-cyan-500/30 active:scale-98"
                }`}
              >
                {enabled ? (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    2FA Enabled ✓
                  </>
                ) : confirming ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldIcon className="w-5 h-5" />
                    Enable Two-Factor Authentication
                  </>
                )}
              </button>

              {/* Status Card */}
              <div className={`rounded-2xl p-5 border-2 transition-all duration-300 ${
                enabled 
                  ? "bg-linear-to-br from-green-50 to-emerald-50 border-green-200" 
                  : "bg-gray-50 border-gray-100"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    enabled ? "bg-green-100" : "bg-gray-100"
                  }`}>
                    {enabled ? (
                      <CheckIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`font-semibold ${enabled ? "text-green-800" : "text-gray-700"}`}>
                      {enabled ? "Protection Active" : "Not Enabled"}
                    </p>
                    <p className={`text-sm ${enabled ? "text-green-600" : "text-gray-500"}`}>
                      {enabled 
                        ? "Your account is now protected with 2FA. You'll need your authenticator app for future logins." 
                        : "Complete the setup to activate two-factor authentication."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recovery Tips */}
              {!enabled && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2">💡 Pro Tips</h4>
                  <ul className="space-y-1.5 text-sm text-amber-700">
                    <li>• Save your backup codes in a secure location</li>
                    <li>• Keep your authenticator app backed up</li>
                    <li>• Never share your 2FA codes with anyone</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: "📱", title: "Lost your phone?", desc: "Use backup codes or contact support" },
              { icon: "🔄", title: "Code not working?", desc: "Ensure your device time is synced" },
              { icon: "❓", title: "Questions?", desc: "Visit our security help center" },
            ].map((item) => (
              <div key={item.title} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-medium text-gray-800 group-hover:text-cyan-600 transition-colors">{item.title}</p>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Success Toast Enhancement */}
      {enabled && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-linear-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-green-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <CheckIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">Security Enhanced!</p>
              <p className="text-sm text-green-100">Your account is now protected with 2FA</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}