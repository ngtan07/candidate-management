import React, { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import authService from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setError(""); setMessage(""); setLoading(true); try { const res = await authService.requestPasswordReset(email.trim()); setMessage(res.message); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  return <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm"><h1 className="text-2xl font-bold text-slate-900">Forgot password</h1><p className="text-sm text-slate-500 mt-2 mb-6">Enter your email and we will send a password reset link.</p>{message && <p role="status" className="mb-4 text-sm text-emerald-700">{message}</p>}{error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}<form onSubmit={submit} className="space-y-4"><Input label="Email address" type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={loading} /><Button type="submit" className="w-full" loading={loading}>Send reset link</Button></form><Link className="block mt-6 text-center text-sm text-indigo-700" to="/login">Return to Login</Link></section>;
}
