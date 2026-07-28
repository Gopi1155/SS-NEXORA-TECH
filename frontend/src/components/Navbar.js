import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { LOGO_URL } from "./motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/courses", label: "Courses" },
  { to: "/internships", label: "Internships" },
  { to: "/feedback", label: "Feedback", authOnly: true },
  { to: "/media", label: "Media" },
  { to: "/contact", label: "Contact Us" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  const visibleLinks = links.filter((l) => !l.authOnly || user);

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#05050A]/70 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" data-testid="nav-logo-link" className="flex items-center gap-3 shrink-0">
          <img src={LOGO_URL} alt="SS Nexora Tech logo" className="h-10 w-10 rounded-full object-cover ring-1 ring-cyan-400/40" />
          <span className="font-heading font-bold tracking-tight text-slate-50 leading-none">
            SS NEXORA <span className="text-cyan-400">TECH</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {visibleLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-full text-sm transition-colors duration-200 ${
                  isActive ? "text-cyan-300 bg-cyan-400/10" : "text-slate-300 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              {user.role !== "admin" && (
                <span data-testid="nav-user-name" className="flex items-center gap-2 text-sm text-slate-300">
                  <User className="w-4 h-4 text-cyan-400" /> {user.name}
                </span>
              )}
              <button data-testid="nav-logout-btn" onClick={handleLogout} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" data-testid="nav-login-link" className="px-4 py-2 rounded-full text-sm text-slate-200 hover:text-white hover:bg-white/5 transition-colors">
                Login
              </Link>
              <Link to="/register" data-testid="nav-register-link" className="glow-btn px-5 py-2 rounded-full text-sm font-medium text-white bg-[#007AFF]">
                Register
              </Link>
            </>
          )}
        </div>

        <button data-testid="nav-mobile-toggle" className="lg:hidden p-2 text-slate-200" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 bg-[#05050A]/95 backdrop-blur-xl px-6 py-6 flex flex-col gap-2" data-testid="nav-mobile-menu">
          {visibleLinks.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={({ isActive }) => `py-2.5 text-base ${isActive ? "text-cyan-300" : "text-slate-300"}`}>
              {l.label}
            </NavLink>
          ))}
          <div className="border-t border-white/10 mt-3 pt-4 flex flex-col gap-3">
            {user ? (
              <button onClick={handleLogout} className="text-left text-slate-300">Logout{user.role !== "admin" ? ` (${user.name})` : ""}</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-slate-200">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="text-cyan-300">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
