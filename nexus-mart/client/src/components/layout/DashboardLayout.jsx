import { NavLink, Outlet } from "react-router-dom";

/**
 * activeClass: full Tailwind class string for the active item
 * (full strings so Tailwind can detect them), e.g. "bg-vendor-soft text-vendor".
 */
const DashboardLayout = ({ title, links, activeClass = "bg-accent-soft text-accent" }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid md:grid-cols-[220px_1fr] gap-8">
    <aside>
      <h2 className="font-display font-bold text-lg mb-5">{title}</h2>
      <nav className="flex md:flex-col gap-1 overflow-x-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive ? activeClass : "text-ink-muted hover:bg-surface"
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
    <div className="min-w-0">
      <Outlet />
    </div>
  </div>
);

export default DashboardLayout;
