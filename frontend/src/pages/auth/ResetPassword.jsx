import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import authService from "../../services/authService";

export default function ResetPassword() {
  const [params] = useSearchParams(); const token = params.get("token") || ""; const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async e => { e.preventDefault(); setError(""); if (password !== confirm) return setError("Passwords do not match."); setLoading(true); try { const res = await authService.resetPassword(token, password); setMessage(res.message); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  return <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm"><h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>{message ? <p className="mt-4 text-emerald-700">{message}</p> : <><p className="text-sm text-slate-500 mt-2 mb-6">Choose a password with at least 8 characters.</p>{error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}<form onSubmit={submit} className="space-y-4"><Input label="New password" type="password" required minLength={8} maxLength={72} value={password} onChange={e => setPassword(e.target.value)} /><Input label="Confirm password" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} /><Button type="submit" className="w-full" loading={loading} disabled={!token}>Reset password</Button></form></>}<Link className="block mt-6 text-center text-sm text-indigo-700" to="/login">Return to Login</Link></section>;
}
