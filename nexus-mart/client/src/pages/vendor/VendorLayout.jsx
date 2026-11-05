import { FiGrid, FiBox, FiShoppingBag, FiSettings } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";

const links = [
  { to: "/vendor/dashboard", label: "Overview", icon: <FiGrid size={16} />, end: true },
  { to: "/vendor/products", label: "Products", icon: <FiBox size={16} /> },
  { to: "/vendor/orders", label: "Orders", icon: <FiShoppingBag size={16} /> },
  { to: "/vendor/settings", label: "Store settings", icon: <FiSettings size={16} /> },
];

const VendorLayout = () => (
  <DashboardLayout title="Vendor panel" links={links} activeClass="bg-vendor-soft text-vendor" />
);

export default VendorLayout;
