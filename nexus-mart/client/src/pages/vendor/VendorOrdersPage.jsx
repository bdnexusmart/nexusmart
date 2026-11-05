import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { orderService } from "../../services";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

const VendorOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    orderService.vendorOrders().then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (orderId, itemId, status) => {
    try {
      await orderService.updateItemStatus(orderId, itemId, status);
      toast.success("Status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
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
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex flex-wrap justify-between gap-2 mb-4 pb-4 border-b border-border text-sm">
                <div>
                  <p className="font-mono-data text-ink-muted">#{order._id.slice(-8)}</p>
                  <p className="text-ink-muted">{order.user?.name} · {order.user?.email}</p>
                </div>
                <p className="text-ink-muted">{order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
              </div>
              <div className="flex flex-col gap-3">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-ink-muted">Qty {item.quantity} · ${item.price.toFixed(2)} each</p>
                    </div>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(order._id, item._id, e.target.value)}
                      aria-label="Item status"
                      className="text-sm border border-border rounded-lg px-2.5 py-1.5 capitalize outline-none focus:border-vendor bg-surface"
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrdersPage;
