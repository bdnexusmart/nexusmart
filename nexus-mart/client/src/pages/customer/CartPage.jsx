import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";
import { cartService } from "../../services";
import { useCart } from "../../context/CartContext";

const CartPage = () => {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const updateQty = async (itemId, quantity) => {
    try {
      await cartService.updateItem(itemId, quantity);
      await refreshCart();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update item");
    }
  };

  const removeItem = async (itemId) => {
    await cartService.removeItem(itemId);
    await refreshCart();
    toast.success("Item removed");
  };

  const unitPrice = (item) => item.product?.discountPrice || item.product?.price || item.price;
  const subtotal = cart.items.reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0);

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold mb-3">Your cart is empty</h1>
        <p className="text-ink-muted mb-6">Browse the marketplace and find something you like.</p>
        <Link to="/products" className="bg-accent text-white font-semibold px-6 py-3 rounded-lg inline-block">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold mb-8">Your cart</h1>
      <div className="grid md:grid-cols-[1fr_320px] gap-10">
        <div className="flex flex-col gap-4">
          {cart.items.map((item) => (
            <div key={item._id} className="flex gap-4 items-center bg-surface border border-border rounded-xl p-4">
              <div className="w-20 h-20 rounded-lg bg-accent-soft overflow-hidden shrink-0">
                {item.product?.images?.[0] && <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.product?.name}</p>
                <p className="font-mono-data text-sm text-ink-muted">${unitPrice(item).toFixed(2)}</p>
              </div>
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => updateQty(item._id, item.quantity - 1)} className="w-8 h-8 text-ink-muted hover:text-ink" aria-label="Decrease">−</button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button onClick={() => updateQty(item._id, item.quantity + 1)} className="w-8 h-8 text-ink-muted hover:text-ink" aria-label="Increase">+</button>
              </div>
              <button onClick={() => removeItem(item._id)} className="text-ink-muted hover:text-cta" aria-label="Remove item">
                <FiTrash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 h-fit">
          <h2 className="font-semibold mb-4">Order summary</h2>
          <div className="flex justify-between text-sm text-ink-muted mb-2">
            <span>Subtotal</span>
            <span className="font-mono-data">${subtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-ink-muted mb-4">Shipping and tax are calculated at checkout.</p>
          <button onClick={() => navigate("/checkout")} className="w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3 rounded-lg transition-colors">
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
