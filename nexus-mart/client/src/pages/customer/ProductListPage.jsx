import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productService, categoryService } from "../../services";
import ProductCard from "../../components/product/ProductCard";

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    categoryService.list().then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    productService
      .list({ keyword, category, page, limit: 12 })
      .then((res) => {
        setProducts(res.data.products);
        setPages(res.data.pages || 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [keyword, category, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  const catBtn = (active) =>
    `text-left px-3 py-2 rounded-lg text-sm ${active ? "bg-accent-soft text-accent font-medium" : "text-ink-muted hover:bg-accent-soft"}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-2xl font-bold">Shop all products</h1>
        <input
          type="search"
          key={keyword}
          defaultValue={keyword}
          placeholder="Search products, press Enter..."
          aria-label="Search products"
          onKeyDown={(e) => e.key === "Enter" && updateParam("keyword", e.target.value.trim())}
          className="w-full sm:w-72 px-4 py-2.5 rounded-lg border border-border bg-surface focus:border-accent outline-none"
        />
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside>
          <h3 className="font-semibold text-sm text-ink-muted uppercase tracking-wide mb-3">Categories</h3>
          <div className="flex flex-col gap-1">
            <button onClick={() => updateParam("category", "")} className={catBtn(!category)}>All categories</button>
            {categories.map((cat) => (
              <button key={cat._id} onClick={() => updateParam("category", cat._id)} className={catBtn(category === cat._id)}>
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        <div>
          {loading ? (
            <p className="text-ink-muted">Loading...</p>
          ) : products.length === 0 ? (
            <p className="text-ink-muted">No products match your search.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-8">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateParam("page", String(i + 1))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium ${page === i + 1 ? "bg-accent text-white" : "border border-border text-ink-muted hover:border-accent"}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
