import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productService, categoryService } from "../../services";
import ProductCard from "../../components/product/ProductCard";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productService.list({ limit: 8 }), categoryService.list()])
      .then(([p, c]) => {
        setProducts(p.data.products);
        setCategories(c.data.categories);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-ink text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="node-divider text-white/80 text-sm font-semibold uppercase tracking-wide mb-4">
              Hundreds of vendors, one checkout
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-5">
              Every vendor.<br />One connected market.
            </h1>
            <p className="text-white/70 mb-8 max-w-md">
              Nexus Mart brings independent sellers together in a single marketplace — browse, compare, and
              check out once, no matter how many stores you buy from.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/products" className="bg-accent hover:bg-accent-dark transition-colors px-6 py-3 rounded-lg font-semibold">
                Start shopping
              </Link>
              <Link to="/register?role=vendor" className="border border-white/30 hover:border-white/60 transition-colors px-6 py-3 rounded-lg font-semibold">
                Sell on Nexus Mart
              </Link>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-3 gap-3" aria-hidden="true">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center" style={{ opacity: 0.45 + (i % 3) * 0.2 }}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-display text-xl font-bold mb-5">Shop by category</h2>
          <div className="flex gap-3 flex-wrap">
            {categories.map((cat) => (
              <Link key={cat._id} to={`/products?category=${cat._id}`} className="px-4 py-2 rounded-full border border-border bg-surface text-sm font-medium text-ink-muted hover:border-accent hover:text-accent transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">Fresh from our vendors</h2>
          <Link to="/products" className="text-accent text-sm font-medium hover:underline">View all →</Link>
        </div>
        {loading ? (
          <p className="text-ink-muted">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="text-ink-muted">No products yet — once vendors are approved and list items, they'll show up here.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
