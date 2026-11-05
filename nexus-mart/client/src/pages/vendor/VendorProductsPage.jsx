import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { productService, categoryService } from "../../services";

const emptyForm = { name: "", description: "", category: "", price: "", discountPrice: "", stock: "", sku: "", images: "" };
const inputCls = "px-3 py-2.5 rounded-lg border border-border outline-none focus:border-vendor";

const VendorProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([productService.myProducts(), categoryService.list()])
      .then(([p, c]) => {
        setProducts(p.data.products);
        setCategories(c.data.categories);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      category: p.category?._id || p.category,
      price: p.price,
      discountPrice: p.discountPrice || "",
      stock: p.stock,
      sku: p.sku,
      images: (p.images || []).join(", "),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: Number(form.stock),
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await productService.update(editingId, payload);
        toast.success("Product updated — pending re-approval");
      } else {
        await productService.create(payload);
        toast.success("Product created — pending admin approval");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await productService.remove(id);
    toast.success("Product deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-vendor text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
          <FiPlus size={16} /> Add product
        </button>
      </div>

      {loading ? (
        <p className="text-ink-muted">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-ink-muted">You haven't listed any products yet.</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg text-ink-muted text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono-data">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${p.isApproved ? "bg-vendor-soft text-vendor" : "bg-cta-soft text-cta"}`}>
                      {p.isApproved ? "Live" : "Pending approval"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <button onClick={() => openEdit(p)} className="text-ink-muted hover:text-accent" aria-label="Edit"><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(p._id)} className="text-ink-muted hover:text-cta" aria-label="Delete"><FiTrash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold">{editingId ? "Edit product" : "Add product"}</h2>
              <button onClick={() => setShowForm(false)} className="text-ink-muted hover:text-ink" aria-label="Close"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input required placeholder="Product name" aria-label="Product name" value={form.name} onChange={set("name")} className={inputCls} />
              <textarea required rows={3} placeholder="Description" aria-label="Description" value={form.description} onChange={set("description")} className={inputCls} />
              <select required value={form.category} onChange={set("category")} aria-label="Category" className={inputCls}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" min="0" placeholder="Price" aria-label="Price" value={form.price} onChange={set("price")} className={inputCls} />
                <input type="number" step="0.01" min="0" placeholder="Discount price (optional)" aria-label="Discount price" value={form.discountPrice} onChange={set("discountPrice")} className={inputCls} />
                <input required type="number" min="0" placeholder="Stock" aria-label="Stock" value={form.stock} onChange={set("stock")} className={inputCls} />
                <input required placeholder="SKU" aria-label="SKU" value={form.sku} onChange={set("sku")} className={inputCls} />
              </div>
              <input placeholder="Image URLs, comma separated" aria-label="Image URLs" value={form.images} onChange={set("images")} className={inputCls} />
              <button disabled={saving} className="bg-vendor text-white font-semibold py-3 rounded-lg mt-2 disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Save changes" : "Create product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProductsPage;
