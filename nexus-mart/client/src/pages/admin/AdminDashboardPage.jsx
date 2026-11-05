import { useEffect, useState } from "react";
import { vendorService, orderService, userService, productService } from "../../services";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([vendorService.adminAll(), orderService.adminAll(), userService.adminList(), productService.adminAll()]).then(
      ([vendors, orders, users, products]) => {
        setStats({
          vendorCount: vendors.data.count,
          pendingVendors: vendors.data.vendors.filter((v) => v.status === "pending").length,
          orderCount: orders.data.count,
          totalRevenue: orders.data.orders.reduce((sum, o) => sum + o.totalPrice, 0),
          commission: orders.data.orders.reduce((sum, o) => sum + o.platformCommission, 0),
          userCount: users.data.count,
          productCount: products.data.total,
          pendingProducts: products.data.products.filter((p) => !p.isApproved).length,
        });
      }
    );
  }, []);

  if (!stats) return <p className="text-ink-muted">Loading...</p>;

  const cards = [
    { label: "Total vendors", value: stats.vendorCount },
    { label: "Vendors awaiting approval", value: stats.pendingVendors },
    { label: "Products listed", value: stats.productCount },
    { label: "Products awaiting approval", value: stats.pendingProducts },
    { label: "Total orders", value: stats.orderCount },
    { label: "Registered users", value: stats.userCount },
    { label: "Gross order value", value: `$${stats.totalRevenue.toFixed(2)}`, mono: true },
    { label: "Platform commission", value: `$${stats.commission.toFixed(2)}`, mono: true },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Platform overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm text-ink-muted mb-1">{c.label}</p>
            <p className={`font-display text-2xl font-bold ${c.mono ? "font-mono-data" : ""}`}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
