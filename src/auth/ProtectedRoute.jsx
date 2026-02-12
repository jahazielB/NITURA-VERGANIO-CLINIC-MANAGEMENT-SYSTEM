import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ allowRoles = [] }) {
  const { user, role, loading } = useSelector((s) => s.auth);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (!role) {
    return (
      <div className="p-4 text-red-600">No role assigned to this account.</div>
    );
  }

  const ok = allowRoles.length === 0 ? true : allowRoles.includes(role);
  if (!ok) return <Navigate to={`/${role}/dashboard`} replace />;

  return <Outlet />;
}
