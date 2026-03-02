import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import Navbar from "./Navbar";

export default function PrivateRoute() {
  const { user, status, setUser, setStatus, clear } = useAuthStore();

  useEffect(() => {
    if (status !== "idle") return;

    setStatus("loading");

    api
      .get("/me")
      .then(({ data }) => {
        setUser(data);
        setStatus("done");
      })
      .catch(() => {
        clear(); 
      });
  }, []);

  if (status === "idle" || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground animate-pulse">
          Verificando sessão...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
