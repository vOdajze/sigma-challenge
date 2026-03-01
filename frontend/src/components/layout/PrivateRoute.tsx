import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Navbar from "./Navbar";

export default function PrivateRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  if (!isAuthenticated)
    return (
      <Navigate
        to="/login"
        replace
      />
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
