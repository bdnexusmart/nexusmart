import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { orderService } from "../../services";
import { useCart } from "../../context/CartContext";

const fields = [
  { name: "street", placeholder: "Street address", full: true },
  { name: "city", placeholder: "City" },
  { name: "state", placeholder: "State / Region" },
  { name: "postalCode", placeholder: "Postal code" },
  { name: "country", placeholder: "Country" },
  { name: "phone", placeholder: "Phone number", full: true },
];

const CheckoutPage = () => {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(Object.fromEntries(fields.map((f) => [f.name, ""])));
  const [placing, setPlacing] = useState(false);

  const unitPrice = (i) => i.product?.discountPrice || i.product?.price || i.price;
  const subtotal = cart.items.reduce((sum, i) => sum + unitPrice(i) * i.quantity, 0);
  const shipping = cart.items.length ? 5 : 0;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      // Payment: cash on delivery only for now. Card payments need a payment gateway (e.g. Stripe) — not wired yet.
      await orderService.create({ shippingAddress: address, paymentMethod: "cod" });
      await refreshCart();
      toast.success("Order placed!");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.items.length === 0) {
    return <p className="text-center py-24 text-ink-muted">Your cart is empty — add items before checking out.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-[1fr_320px] gap-10">
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Shipping address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <input
                  key={f.name}
                  required
                  name={f.name}
                  placeholder={f.placeholder}
                  aria-label={f.placeholder}
                  value={address[f.name]}
                  onChange={(e) => setAddress((a) => ({ ...a, [f.name]: e.target.value }))}
                  className={`${f.full ? "sm:col-span-2" : ""} px-3 py-2.5 rounded-lg border border-border outline-none focus:border-accent`}
                />
              ))}
            </div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Payment method</h2>
            <div className="px-4 py-3 rounded-lg border border-accent bg-accent-soft text-sm font-medium">
              Cash on delivery
            </div>
            <p className="text-xs text-ink-muted mt-2">Online card payments aren't enabled yet.</p>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 h-fit">
          <h2 className="font-semibold mb-4">Order summary</h2>
          <div className="flex flex-col gap-2 text-sm mb-4">
            <div className="flex justify-between text-ink-muted"><span>Subtotal</span><span className="font-mono-data">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-ink-muted"><span>Shipping</span><span className="font-mono-data">${shipping.toFixed(2)}</span></div>
            <div className="flex justify-between text-ink-muted"><span>Tax</span><span className="font-mono-data">${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold pt-2 border-t border-border"><span>Total</span><span className="font-mono-data">${total.toFixed(2)}</span></div>
          </div>
          <button disabled={placing} className="w-full bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
            {placing ? "Placing order..." : "Place order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
