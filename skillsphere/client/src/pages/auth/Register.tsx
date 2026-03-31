import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import API from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../../components/auth/AuthShell";
import { Button, Input, Label } from "../../components/auth/Ui";
import { GoogleLogin } from "@react-oauth/google";

// Form Type
interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: "client" | "freelancer";
}

function Register() {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    role: "client",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  // Submit Handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      setDevToken(null);
      const { data } = await API.post<{ verificationToken?: string }>("/auth/register", form);
      toast.success("Account created. Please verify your email.");
      if (data.verificationToken) {
        setDevToken(data.verificationToken);
      }
      navigate("/verify-email");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // Input Handler
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join SkillSphere and start building verified local work history."
      footer={
        <div className="flex items-center justify-between gap-3 text-sm">
          <Link to="/" className="text-slate-600 hover:text-slate-900">
            Back to login
          </Link>
          <Link to="/verify-email" className="text-cyan-700 hover:text-cyan-800">
            Verify email
          </Link>
        </div>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">Create instantly</div>
          <div className="mt-1 text-sm text-slate-600">
            Use Google to create your account in seconds (email will be verified automatically).
          </div>
          <div className="mt-3 grid place-items-center">
            {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
              <GoogleLogin
                onSuccess={async (cred) => {
                  const token = cred.credential;
                  if (!token) {
                    toast.error("Google sign-up failed.");
                    return;
                  }
                  try {
                    setLoading(true);
                    const { data } = await API.post("/auth/google", { idToken: token });
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user", JSON.stringify(data));
                    toast.success("Account created with Google.");
                    navigate("/dashboard");
                  } catch (err: any) {
                    toast.error(err.response?.data?.message || "Google sign-up failed.");
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => toast.error("Google sign-up failed.")}
                useOneTap={false}
              />
            ) : (
              <div className="w-full rounded-xl bg-white p-3 text-center text-xs text-slate-600 ring-1 ring-slate-200">
                Google sign-up is not configured. Set <span className="font-semibold">VITE_GOOGLE_CLIENT_ID</span>.
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
          <Label>Name</Label>
          <Input name="name" placeholder="Your name" value={form.name} onChange={handleChange} />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>

        <div>
          <Label>Password</Label>
          <Input
            name="password"
            type="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
        </div>

        <div>
          <Label>Role</Label>
          <select
            name="role"
            value={form.role}
            className="h-11 w-full rounded-xl bg-white/5 px-4 text-sm text-black ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/70"
            onChange={handleChange}
          >
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>
        </div>

        <Button loading={loading} type="submit">
          Create account
        </Button>

        {devToken ? (
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <div className="text-xs font-semibold text-slate-700">Dev verification token</div>
            <div className="mt-2 break-all rounded-xl bg-white p-3 text-xs text-slate-800 ring-1 ring-slate-200">
              {devToken}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button
                variant="secondary"
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(devToken);
                  toast.success("Token copied.");
                }}
              >
                Copy token
              </Button>
              <Link to={`/verify-email?token=${encodeURIComponent(devToken)}`}>
                <Button type="button">Open verify page</Button>
              </Link>
            </div>
          </div>
        ) : null}
      </form>
    </AuthShell>
  );
}

export default Register;