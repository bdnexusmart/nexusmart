import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { vendorService } from "../../services";

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-border bg-surface outline-none focus:border-vendor";

const VendorSettingsPage = () => {
  const [form, setForm] = useState({ storeName: "", description: "", logo: "", banner: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    vendorService
      .myProfile()
      .then((res) => {
        const v = res.data.vendor;
        setForm({ storeName: v.storeName || "", description: v.description || "", logo: v.logo || "", banner: v.banner || "" });
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await vendorService.updateProfile(form);
      toast.success("Store profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-ink-muted">Loading...</p>;

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-bold mb-6">Store settings</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-ink-muted mb-1 block">Store name</label>
          <input required value={form.storeName} onChange={set("storeName")} className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-muted mb-1 block">Description</label>
          <textarea rows={4} value={form.description} onChange={set("description")} className={inputCls} />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-muted mb-1 block">Logo URL</label>
          <input value={form.logo} onChange={set("logo")} className={inputCls} />
        </div>
        <button disabled={saving} className="bg-vendor text-white font-semibold py-3 rounded-lg mt-2 disabled:opacity-50">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default VendorSettingsPage;
