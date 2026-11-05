import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { vendorService } from "../../services";

const VendorListPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorService.list().then((res) => setVendors(res.data.vendors)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold mb-8">Vendors on Nexus Mart</h1>
      {loading ? (
        <p className="text-ink-muted">Loading...</p>
      ) : vendors.length === 0 ? (
        <p className="text-ink-muted">No approved vendors yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vendors.map((v) => (
            <Link key={v._id} to={`/vendors/${v.slug}`} className="bg-surface border border-border rounded-xl p-5 hover:border-accent transition-colors">
              <div className="w-12 h-12 rounded-lg bg-vendor-soft flex items-center justify-center font-display font-bold text-vendor mb-3">
                {v.storeName.charAt(0)}
              </div>
              <h3 className="font-semibold mb-1">{v.storeName}</h3>
              <p className="text-sm text-ink-muted line-clamp-2">{v.description || "A Nexus Mart vendor."}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorListPage;
