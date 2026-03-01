import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Map, Package, Wallet, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/caixa", label: "Caixa", icon: Wallet },
  { to: "/mapa", label: "Mapa GIS", icon: Map },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between h-14 px-6">
        <span className="font-semibold text-lg tracking-tight">Sigma</span>

        <div className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
            >
              <Button
                variant={pathname === to ? "secondary" : "ghost"}
                size="sm"
                className={cn("gap-2", pathname === to && "font-medium")}
              >
                <Icon size={15} />
                {label}
              </Button>
            </Link>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut size={15} />
          Sair
        </Button>
      </div>
    </nav>
  );
}
