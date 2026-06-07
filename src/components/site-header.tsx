import { Link } from "@tanstack/react-router";
import { Shield, LogOut } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { isAdmin, logout } = useStore();
  return (
<header className="sticky top-0 z-40 border-b border-white/10 bg-white/5 backdrop-blur-sm">
<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-hero grid h-10 w-10 place-items-center rounded-lg shadow-elegant">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-primary">
              Hội thi
            </div>
            <div className="text-xs text-muted-foreground -mt-0.5">
              Hệ thống bốc thăm
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground"
            activeOptions={{ exact: true }}
            activeProps={{ className: "bg-accent text-accent-foreground" }}
          >
            Trang thi
          </Link>
          <Link
            to="/admin"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground"
            activeProps={{ className: "bg-accent text-accent-foreground" }}
          >
            Quản trị
          </Link>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={logout}>
              <LogOut /> Đăng xuất
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
