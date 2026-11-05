import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const inputCls = "px-4 py-3 rounded-lg border border-border bg-surface outline-none focus:border-accent";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      const from = location.state?.from?.pathname;
      const dest = from || (user.role === "admin" ? "/admin/dashboard" : user.role === "vendor" ? "/vendor/dashboard" : "/");
      navigate(dest, { replace: true });
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-20">
      <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
      <p className="text-ink-muted mb-8">Log in to your Nexus Mart account.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input required type="email" placeholder="Email" aria-label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} />
        <input required type="password" placeholder="Password" aria-label="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className={inputCls} />
        <button disabled={loading} className="bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="text-sm text-ink-muted mt-6 text-center">
        Don't have an account? <Link to="/register" className="text-accent font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  );
};

export default LoginPage;
