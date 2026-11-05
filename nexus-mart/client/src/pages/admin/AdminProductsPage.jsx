import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { productService } from "../../services";

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    productService.adminAll().then((res) => setProducts(res.data.products)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id, isApproved) => {
    try {
      await productService.approve(id, isApproved);
      toast.success(isApproved ? "Product approved" : "Product unapproved");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update product");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Products</h1>
      {loading ? (
        <p className="text-ink-muted">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-ink-muted">No products found.</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg text-ink-muted text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{p.vendor?.storeName}</td>
                  <td className="px-4 py-3 font-mono-data">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.isApproved ? "bg-vendor-soft text-vendor" : "bg-cta-soft text-cta"}`}>
                      {p.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleApprove(p._id, !p.isApproved)} className="text-accent text-sm font-medium hover:underline">
                      {p.isApproved ? "Unapprove" : "Approve"}
                    </button>
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

export default AdminProductsPage;
