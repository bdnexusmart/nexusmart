import { FiGrid, FiUsers, FiShoppingBag, FiBox, FiPackage } from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";

const links = [
  { to: "/admin/dashboard", label: "Overview", icon: <FiGrid size={16} />, end: true },
  { to: "/admin/vendors", label: "Vendors", icon: <FiShoppingBag size={16} /> },
  { to: "/admin/products", label: "Products", icon: <FiBox size={16} /> },
  { to: "/admin/orders", label: "Orders", icon: <FiPackage size={16} /> },
  { to: "/admin/users", label: "Users", icon: <FiUsers size={16} /> },
];

const AdminLayout = () => <DashboardLayout title="Admin panel" links={links} activeClass="bg-ink text-white" />;

export default AdminLayout;
