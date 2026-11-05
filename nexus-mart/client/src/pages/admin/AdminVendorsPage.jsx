import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { vendorService } from "../../services";

const statusOptions = ["pending", "approved", "rejected", "suspended"];
const statusColor = {
  pending: "bg-cta-soft text-cta",
  approved: "bg-vendor-soft text-vendor",
  rejected: "bg-border text-ink-muted",
  suspended: "bg-border text-ink-muted",
};

const AdminVendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    vendorService.adminAll(filter || undefined).then((res) => setVendors(res.data.vendors)).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleStatusChange = async (id, status) => {
    try {
      await vendorService.adminSetStatus(id, status);
      toast.success("Vendor status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update vendor");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Vendors</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status" className="text-sm border border-border rounded-lg px-3 py-2 capitalize outline-none bg-surface">
          <option value="">All statuses</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-ink-muted">Loading...</p>
      ) : vendors.length === 0 ? (
        <p className="text-ink-muted">No vendors found.</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg text-ink-muted text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Store</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v._id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{v.storeName}</td>
                  <td className="px-4 py-3 text-ink-muted">{v.user?.name} · {v.user?.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor[v.status]}`}>{v.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={v.status} onChange={(e) => handleStatusChange(v._id, e.target.value)} aria-label="Set vendor status" className="text-sm border border-border rounded-lg px-2.5 py-1.5 capitalize outline-none bg-surface">
                      {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
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

export default AdminVendorsPage;
