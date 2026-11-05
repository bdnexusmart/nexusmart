import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const inputCls = "px-4 py-3 rounded-lg border border-border bg-surface outline-none focus:border-accent";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get("role") === "vendor" ? "vendor" : "customer");
  const [form, setForm] = useState({ name: "", email: "", password: "", storeName: "" });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      toast.success(role === "vendor" ? "Vendor account created — pending admin approval" : `Welcome, ${user.name.split(" ")[0]}!`);
      navigate(role === "vendor" ? "/vendor/dashboard" : "/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-2xl font-bold mb-1">Create your account</h1>
      <p className="text-ink-muted mb-6">Join Nexus Mart as a shopper or a seller.</p>

      <div className="flex gap-2 mb-6 p-1 bg-accent-soft rounded-lg">
        {[{ value: "customer", label: "Shop" }, { value: "vendor", label: "Sell" }].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRole(opt.value)}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${role === opt.value ? "bg-white text-accent shadow-sm" : "text-ink-muted"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input required placeholder="Full name" aria-label="Full name" value={form.name} onChange={set("name")} className={inputCls} />
        <input required type="email" placeholder="Email" aria-label="Email" value={form.email} onChange={set("email")} className={inputCls} />
        <input required type="password" minLength={6} placeholder="Password (min. 6 characters)" aria-label="Password" value={form.password} onChange={set("password")} className={inputCls} />
        {role === "vendor" && (
          <input required placeholder="Store name" aria-label="Store name" value={form.storeName} onChange={set("storeName")} className={inputCls} />
        )}
        <button disabled={loading} className="bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-ink-muted mt-6 text-center">
        Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Log in</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
