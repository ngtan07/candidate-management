import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { ROLE } from "../../utils/constants";
import toast from "react-hot-toast";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email: email.trim(), password });
      toast.success(res.message || "Logged in successfully!");

      const role = res?.data?.role;
      if (from) {
        navigate(from, { replace: true });
      } else if (role === ROLE.RECRUITER) {
        navigate("/recruiter/dashboard", { replace: true });
      } else if (role === ROLE.ADMIN) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/jobs", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter your credentials to access your TalentPulse account.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="name@company.com"
          required
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          autoComplete="current-password"
        />

        <div className="text-right"><Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Forgot password?</Link></div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={loading}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-600 mb-3">Don't have an account yet?</p>
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            to="/register/candidate"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            Sign up as Candidate
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/register/recruiter"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Register as Recruiter
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

