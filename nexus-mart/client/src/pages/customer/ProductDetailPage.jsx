import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiStar } from "react-icons/fi";
import { productService, reviewService, cartService } from "../../services";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    productService
      .getBySlug(slug)
      .then((res) => {
        setProduct(res.data.product);
        return reviewService.list(res.data.product._id);
      })
      .then((res) => setReviews(res.data.reviews))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    if (user.role !== "customer") return toast.error("Only customer accounts can shop");
    try {
      await cartService.addItem({ productId: product._id, quantity });
      await refreshCart();
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add to cart");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewService.create(product._id, reviewForm);
      const { data } = await reviewService.list(product._id);
      setReviews(data.reviews);
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Review posted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not post review");
    }
  };

  if (loading) return <p className="text-center py-24 text-ink-muted">Loading...</p>;
  if (!product) return <p className="text-center py-24 text-ink-muted">Product not found.</p>;

  const price = product.discountPrice || product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-square rounded-xl bg-accent-soft overflow-hidden mb-3">
            {product.images?.[activeImage] ? (
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-accent/50 font-display">No image</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${activeImage === i ? "border-accent" : "border-border"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Link to={`/vendors/${product.vendor?.slug}`} className="node-divider text-sm text-accent font-medium hover:underline">
            {product.vendor?.storeName}
          </Link>
          <h1 className="font-display text-3xl font-bold mt-2 mb-3">{product.name}</h1>

          {product.ratingCount > 0 && (
            <div className="flex items-center gap-1.5 mb-4 text-sm">
              <FiStar className="text-cta" fill="currentColor" size={16} />
              <span className="font-medium">{product.ratingAverage}</span>
              <span className="text-ink-muted">({product.ratingCount} reviews)</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-mono-data text-3xl font-bold text-ink">${price.toFixed(2)}</span>
            {product.discountPrice && (
              <span className="font-mono-data text-lg text-ink-muted line-through">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="text-ink-muted leading-relaxed mb-6">{product.description}</p>

          <p className="text-sm mb-6">
            {product.stock > 0 ? (
              <span className="text-vendor font-medium">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-cta font-medium">Out of stock</span>
            )}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-border rounded-lg bg-surface">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 text-ink-muted hover:text-ink" aria-label="Decrease quantity">−</button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="w-10 h-10 text-ink-muted hover:text-ink" aria-label="Increase quantity">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-accent hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>

      <section className="mt-16 max-w-2xl">
        <h2 className="font-display text-xl font-bold mb-5">Reviews</h2>

        {user?.role === "customer" && (
          <form onSubmit={handleReviewSubmit} className="mb-8 p-5 rounded-xl border border-border bg-surface">
            <p className="text-xs text-ink-muted mb-3">Only customers who purchased this product can review it.</p>
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setReviewForm((f) => ({ ...f, rating: star }))} aria-label={`${star} stars`}>
                  <FiStar size={20} className={star <= reviewForm.rating ? "text-cta" : "text-border"} fill={star <= reviewForm.rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <textarea
              required
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Share your thoughts on this product..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border outline-none focus:border-accent mb-3"
            />
            <button className="bg-ink text-white text-sm font-semibold px-5 py-2 rounded-lg">Post review</button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-ink-muted text-sm">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-5">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-border pb-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{r.user?.name}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={12} className={i < r.rating ? "text-cta" : "text-border"} fill={i < r.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-ink-muted">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetailPage;
