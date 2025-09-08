import { Link, NavLink, useLocation } from "react-router-dom";
import "./styles/header.css";
import { History, Settings, Database } from 'lucide-react';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { Button } from "./ui/button";

export default function Header() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-separator bg-card">
      <div className="px-10 py-2 flex flex-row items-center justify-between">
        {/* Brand + Desktop Nav */}
        <div className="brand">
          <NavLink to="https://franciscoborges2002.github.io/steamShark/" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">🦈</span>
            </div>
            <span className="font-bold text-xl shark-text">SteamShark</span>
          </NavLink>

          <nav className="nav-desktop">
            <Button variant={isActive("/history") ? "outline" : "ghost"} className="hover:bg-background/50  hover:text-muted-foreground">
              <NavLink
                to="/history"
                className={`nav-link ${isActive("/history") ? "active" : ""}`}
              >
                <History className="icon" />
                <span>History</span>
              </NavLink>
            </Button>
            <Button variant={isActive("/settings") ? "outline" : "ghost"} className="hover:bg-background/50  hover:text-muted-foreground">
              <NavLink
                to="/settings"
                className={`nav-link ${isActive("/settings") ? "active" : ""}`}
              >
                <Settings className="icon" />
                <span>Settings</span>
              </NavLink>
            </Button>
            <Button variant={isActive("/database") ? "outline" : "ghost"} className="hover:bg-background/50  hover:text-muted-foreground">
              <NavLink
                to="/database"
                className={`nav-link ${isActive("/database") ? "active" : ""}`}
              >
                <Database className="icon" />
                <span>Local Database</span>
              </NavLink>
            </Button>
          </nav>
        </div>

        {/* GitHub */}
        <Button variant="outline" className="hover:bg-background hover:text-muted-foreground cursor-pointer">
          <Link to="https://github.com/steamShark" target="_blank" className="flex flex-row items-center gap-2 w-full">
            <SiGithub className="" />
            <span className="text-md">GitHub</span>
          </Link>
        </Button>
        {/* <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="github-btn"
        >
          <SiGithub className="icon" />
          <span className="github-text">GitHub</span>
        </a> */}
      </div>

      {/* Mobile Nav */}
      {/* <div className="container">
        <nav className="nav-mobile">
          <NavLink
            to="/history"
            className={`nav-link ${isActive("/history") ? "active" : ""}`}
          >
            <History size={16} /> 
            <span className="nav-mobile-label">History</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={`nav-link ${isActive("/settings") ? "active" : ""}`}
          >
            {/* <Settings size={16} /> 
            <span className="nav-mobile-label">Settings</span>
          </NavLink>
          <NavLink
            to="/database"
            className={`nav-link ${isActive("/database") ? "active" : ""}`}
          >
            {/* <Database size={16} /> 
            <span className="nav-mobile-label">Database</span>
          </NavLink>
        </nav>
      </div>*/}
    </header>
  );
}
