import { useEffect, useState } from "react";
import { orderService } from "../../services";

const statusColor = {
  pending: "bg-cta-soft text-cta",
  processing: "bg-accent-soft text-accent",
  shipped: "bg-vendor-soft text-vendor",
  delivered: "bg-vendor-soft text-vendor",
  cancelled: "bg-border text-ink-muted",
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.mine().then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-24 text-ink-muted">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold mb-8">Your orders</h1>
      {orders.length === 0 ? (
        <p className="text-ink-muted">You haven't placed any orders yet.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {orders.map((order) => (
            <div key={order._id} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-border">
                <div>
                  <p className="text-xs text-ink-muted font-mono-data">#{order._id.slice(-8)}</p>
                  <p className="text-xs text-ink-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="font-mono-data font-semibold">${order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex flex-col gap-3">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-accent-soft" />}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-ink-muted text-xs">Qty {item.quantity}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor[item.status] || "bg-border text-ink-muted"}`}>
                      {item.status}
                    </span>
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

export default MyOrdersPage;
