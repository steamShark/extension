import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./styles/header.css";
import { History, Settings, Database, Menu, X } from "lucide-react";
import { SiGithub } from '@icons-pack/react-simple-icons';
import { Button } from "../../components/ui/button";

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { to: "/history", label: "History", icon: History },
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/database", label: "Local Database", icon: Database },
  ];

  return (
    <header className="border-b border-separator bg-card">
      <div className="px-6 md:px-10 py-2 flex flex-row items-center justify-between">
        {/* Brand + Desktop Nav */}
        <div className="flex items-center gap-6">
          <NavLink
            to="https://steamshark.app"
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">🦈</span>
            </div>
            <span className="font-bold text-xl shark-text">SteamShark</span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Button
                key={to}
                variant={isActive(to) ? "outline" : "ghost"}
                className="hover:bg-background/50 hover:text-muted-foreground"
              >
                <NavLink
                  to={to}
                  className={`nav-link flex items-center gap-2 ${isActive(to) ? "active" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </NavLink>
              </Button>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* GitHub — hidden on very small screens */}
          <Button
            variant="outline"
            className="hidden sm:flex hover:bg-background hover:text-muted-foreground cursor-pointer"
          >
            <Link
              to="https://github.com/steamShark"
              target="_blank"
              className="flex flex-row items-center gap-2 w-full"
            >
              <SiGithub />
              <span className="text-md">GitHub</span>
            </Link>
          </Button>

          {/* Hamburger — mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((prev: any) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-separator bg-card px-6 py-3 flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Button
              key={to}
              variant={isActive(to) ? "outline" : "ghost"}
              className="w-full justify-start hover:bg-background/50 hover:text-muted-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <NavLink
                to={to}
                className={`nav-link flex items-center gap-2 w-full ${isActive(to) ? "active" : ""}`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            </Button>
          ))}

          {/* GitHub in mobile drawer too */}
          <Button
            variant="outline"
            className="w-full justify-start sm:hidden hover:bg-background hover:text-muted-foreground cursor-pointer mt-1"
          >
            <Link
              to="https://github.com/steamShark"
              target="_blank"
              className="flex flex-row items-center gap-2 w-full"
            >
              <SiGithub />
              <span>GitHub</span>
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}
