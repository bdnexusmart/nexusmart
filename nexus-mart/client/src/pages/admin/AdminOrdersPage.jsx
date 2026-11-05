import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { orderService } from "../../services";

const paymentStatuses = ["unpaid", "paid", "refunded", "failed"];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    orderService
      .adminAll()
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePaymentChange = async (id, status) => {
    try {
      await orderService.adminUpdatePaymentStatus(id, status);
      toast.success("Payment status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update order");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Orders</h1>

      {loading ? (
        <p className="text-ink-muted">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-ink-muted">No orders yet.</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg text-ink-muted text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Commission</th>
                <th className="px-4 py-3 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono-data text-ink-muted">#{o._id.slice(-8)}</td>
                  <td className="px-4 py-3">{o.user?.name}</td>
                  <td className="px-4 py-3">{o.items.length}</td>
                  <td className="px-4 py-3 font-mono-data">${o.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono-data text-vendor">
                    ${o.platformCommission.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={o.paymentStatus}
                      onChange={(e) => handlePaymentChange(o._id, e.target.value)}
                      className="text-sm border border-border rounded-lg px-2.5 py-1.5 capitalize outline-none"
                    >
                      {paymentStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
