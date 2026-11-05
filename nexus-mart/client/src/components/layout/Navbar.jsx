import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const homeFor = (role) =>
  role === "admin" ? "/admin/dashboard" : role === "vendor" ? "/vendor/dashboard" : "/orders";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold text-ink flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent inline-block" />
          Nexus<span className="text-accent">Mart</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-ink-muted">
          <Link to="/products" className="hover:text-accent transition-colors">Shop</Link>
          <Link to="/vendors" className="hover:text-accent transition-colors">Vendors</Link>
          {!user && (
            <Link to="/register?role=vendor" className="hover:text-accent transition-colors">
              Sell on Nexus Mart
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user?.role === "customer" && (
            <Link to="/cart" className="relative text-ink hover:text-accent transition-colors" aria-label="Cart">
              <FiShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-cta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={homeFor(user.role)}
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent transition-colors"
              >
                <FiUser size={16} />
                {user.name.split(" ")[0]}
              </Link>
              <button onClick={handleLogout} className="text-ink-muted hover:text-cta transition-colors" title="Logout" aria-label="Logout">
                <FiLogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm font-medium">
              <Link to="/login" className="text-ink-muted hover:text-accent transition-colors">Login</Link>
              <Link to="/register" className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
