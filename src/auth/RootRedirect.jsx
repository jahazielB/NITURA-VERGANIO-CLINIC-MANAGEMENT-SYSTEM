import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "../pages/Login";

export default function RootRedirect() {
  const { user, role, loading } = useSelector((s) => s.auth);

  if (loading) return <div className="p-4">Loading...</div>;

  if (!user) return <Login />;

  if (!role) {
    return (
      <div className="p-4 text-red-600">No role assigned to this account.</div>
    );
  }

  return <Navigate to={`/${role}/dashboard`} replace />;
}
