import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Map, Package, Wallet, LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/produtos", label: "Produtos", icon: Package },
  { to: "/caixa", label: "Caixa", icon: Wallet },
  { to: "/mapa", label: "Mapa GIS", icon: Map },
];

function getInitials(username: string) {
  return username
    .split(/[\s._-]/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, clear } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {
    } finally {
      clear();
      navigate("/login");
    }
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between h-14 px-6">
        <span className="font-semibold text-lg tracking-tight select-none">
          Sigma
        </span>

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

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-full pl-1 pr-2.5 py-1 hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">
                  {user.username}
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-52"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">
                      {user.username}
                    </span>
                    {user.email ?
                      <span className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </span>
                    : <span className="text-xs text-muted-foreground/60 italic">
                        sem e-mail
                      </span>
                    }
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive gap-2 cursor-pointer"
              >
                <LogOut size={14} />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
