import { useState } from "react";
import type { ChangeEvent, FormEvent} from 'react';

import API from "../../../../services/api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../../../../components/auth/AuthShell";
import { Button, Input, Label } from "../../../../components/auth/Ui";
import { GoogleLogin } from "@react-oauth/google";

// Type for Form
interface LoginForm {
  email: string;
  password: string;
}

// API Response Types
interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  isVerified?: boolean;
  twoFactorEnabled?: boolean;
  authProvider?: string;
}

interface TwoFactorLoginResponse {
  requiresTwoFactor: true;
  twoFactorToken: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified?: boolean;
  twoFactorEnabled?: boolean;
  authProvider?: string;
}

function Login() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [step, setStep] = useState<"login" | "2fa">("login");
  const [twoFactorToken, setTwoFactorToken] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleGoogle = async (idToken: string) => {
    try {
      setLoading(true);
      const { data } = await API.post<UserResponse>("/auth/google", { idToken });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Signed in with Google.");
      navigate("/home");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  //  Submit Handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (step === "login") {
        const { data } = await API.post<UserResponse | TwoFactorLoginResponse>("/auth/login", form);

        if ("requiresTwoFactor" in data && data.requiresTwoFactor) {
          setTwoFactorToken(data.twoFactorToken);
          setStep("2fa");
          toast.success("Enter your 2FA code to continue.");
          return;
        }

        const successData = data as UserResponse;
        localStorage.setItem("token", successData.token);
        localStorage.setItem("user", JSON.stringify(successData));
        toast.success("Welcome back!");
        navigate("/dashboard");
        return;
      }

      // step === "2fa"
      const { data } = await API.post<UserResponse>("/auth/2fa/verify", {
        twoFactorToken,
        code,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Verified. Logged in.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };


  // Input Change Handler
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AuthShell
      title={step === "login" ? "Welcome back" : "Two-factor verification"}
      subtitle={
        step === "login"
          ? "Log in to your SkillSphere workspace."
          : "Enter the 6-digit code from your authenticator app."
      }
      footer={
        <div className="flex items-center justify-between gap-3 text-sm">
          {step === "login" ? (
            <>
              <Link to="/forgot-password" className="text-slate-600 hover:text-slate-900">
                Forgot password?
              </Link>
              <Link to="/resend-verification" className="text-cyan-700 hover:text-cyan-800">
                Resend verification
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="text-slate-600 hover:text-slate-900"
              onClick={() => {
                setStep("login");
                setTwoFactorToken("");
                setCode("");
              }}
            >
              Back
            </button>
          )}
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {step === "login" ? (
          <>
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="text-sm font-semibold text-slate-900">Fast sign-in</div>
              <div className="mt-3 grid place-items-center">
                {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                  <GoogleLogin
                    onSuccess={(cred) => {
                      const token = cred.credential;
                      if (!token) {
                        toast.error("Google sign-in failed.");
                        return;
                      }
                      void handleGoogle(token);
                    }}
                    onError={() => toast.error("Google sign-in failed.")}
                    useOneTap={false}
                  />
                ) : (
                  <div className="w-full rounded-xl bg-white p-3 text-center text-xs text-slate-600 ring-1 ring-slate-200">
                    Google sign-in is not configured. Set <span className="font-semibold">VITE_GOOGLE_CLIENT_ID</span>.
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <div className="text-xs font-medium text-slate-500">OR</div>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <Button loading={loading} type="submit">
              Continue
            </Button>

            <div className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="text-cyan-700 hover:text-cyan-800">
                Create one
              </Link>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label>6-digit code</Label>
              <Input
                type="text"
                name="code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>

            <Button loading={loading} type="submit">
              Verify & sign in
            </Button>
          </>
        )}
      </form>
    </AuthShell>
  );
}

export default Login;