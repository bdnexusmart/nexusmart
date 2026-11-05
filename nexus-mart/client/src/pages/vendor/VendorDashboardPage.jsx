import { useEffect, useState } from "react";
import { vendorService } from "../../services";

const statusBanner = {
  pending: "Your store is pending admin approval. You can add products once you're approved, and they go live after review.",
  rejected: "Your vendor application was rejected. Contact support for details.",
  suspended: "Your vendor account has been suspended.",
};

const VendorDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorService.dashboard().then((res) => setDashboard(res.data.dashboard)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-ink-muted">Loading...</p>;
  if (!dashboard) return <p className="text-ink-muted">Could not load dashboard.</p>;

  const stats = [
    { label: "Products listed", value: dashboard.productCount },
    { label: "Orders received", value: dashboard.totalOrders },
    { label: "Total sales", value: `$${dashboard.totalSales.toFixed(2)}`, mono: true },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Welcome, {dashboard.storeName}</h1>
      <p className="text-ink-muted mb-6">Here's how your store is performing.</p>

      {statusBanner[dashboard.status] && (
        <div className="rounded-lg px-4 py-3 text-sm font-medium mb-6 bg-cta-soft text-cta">{statusBanner[dashboard.status]}</div>
      )}

      <div className="grid sm:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm text-ink-muted mb-1">{s.label}</p>
            <p className={`font-display text-3xl font-bold ${s.mono ? "font-mono-data" : ""}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorDashboardPage;
