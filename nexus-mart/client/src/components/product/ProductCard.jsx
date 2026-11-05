import { Link } from "react-router-dom";
import { FiStar } from "react-icons/fi";

const ProductCard = ({ product }) => {
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group bg-surface rounded-xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="aspect-square bg-accent-soft overflow-hidden relative">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-accent/50 font-display text-sm">No image</div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-cta text-white text-[11px] font-bold px-2 py-1 rounded-md">SALE</span>
        )}
      </div>
      <div className="p-3.5">
        <p className="node-divider text-[11px] uppercase tracking-wide text-ink-muted mb-1">
          {product.vendor?.storeName || "Nexus Mart"}
        </p>
        <h3 className="font-medium text-ink line-clamp-2 leading-snug mb-1.5">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono-data font-semibold text-ink">${price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="font-mono-data text-xs text-ink-muted line-through">${product.price.toFixed(2)}</span>
            )}
          </div>
          {product.ratingCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <FiStar className="text-cta" size={12} fill="currentColor" />
              {product.ratingAverage}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
