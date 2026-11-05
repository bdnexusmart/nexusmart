import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { userService } from "../../services";

const roleColor = {
  customer: "bg-accent-soft text-accent",
  vendor: "bg-vendor-soft text-vendor",
  admin: "bg-ink text-white",
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    userService.adminList(role || undefined).then((res) => setUsers(res.data.users)).finally(() => setLoading(false));
  };

  useEffect(load, [role]);

  const toggleActive = async (id, isActive) => {
    try {
      await userService.adminSetStatus(id, isActive);
      toast.success(isActive ? "User activated" : "User deactivated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update user");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role" className="text-sm border border-border rounded-lg px-3 py-2 outline-none bg-surface">
          <option value="">All roles</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <p className="text-ink-muted">Loading...</p>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg text-ink-muted text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${roleColor[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u.isActive ? <span className="text-vendor text-xs font-medium">Active</span> : <span className="text-cta text-xs font-medium">Deactivated</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toggleActive(u._id, !u.isActive)} className="text-accent text-sm font-medium hover:underline">
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
