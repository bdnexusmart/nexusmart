import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { vendorService, productService } from "../../services";
import ProductCard from "../../components/product/ProductCard";

const VendorStorePage = () => {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    vendorService
      .getBySlug(slug)
      .then((res) => {
        setVendor(res.data.vendor);
        return productService.list({ vendor: res.data.vendor._id, limit: 24 });
      })
      .then((res) => setProducts(res.data.products))
      .catch(() => setVendor(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="text-center py-24 text-ink-muted">Loading...</p>;
  if (!vendor) return <p className="text-center py-24 text-ink-muted">Vendor not found.</p>;

  return (
    <div>
      <section className="bg-vendor-soft border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-vendor text-white flex items-center justify-center font-display font-bold text-2xl">
            {vendor.storeName.charAt(0)}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">{vendor.storeName}</h1>
            <p className="text-ink-muted text-sm mt-1">{vendor.description}</p>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {products.length === 0 ? (
          <p className="text-ink-muted">This vendor hasn't listed any products yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorStorePage;
