import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Lenis from "@studio-freight/lenis";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Internships from "./pages/Internships";
import InternshipDetail from "./pages/InternshipDetail";
import Media from "./pages/Media";
import FeedbackPage from "./pages/FeedbackPage";
import Contact from "./pages/Contact";
import AuthPage from "./pages/AuthPage";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="pt-40 text-center text-slate-400">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function Shell() {
  const { pathname } = useLocation();
  const isAdminArea = pathname.startsWith("/admin");
  return (
    <>
      <ScrollToTop />
      {!isAdminArea && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/internships/:id" element={<InternshipDetail />} />
          <Route path="/media" element={<Media />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </main>
      {!isAdminArea && <Footer />}
    </>
  );
}

function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let rafId;
    const raf = (time) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
    rafId = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(rafId); lenis.destroy(); };
  }, []);

  return (
    <div className="App min-h-screen bg-[#05050A] text-slate-100">
      <AuthProvider>
        <BrowserRouter>
          <Shell />
          <Toaster position="top-right" theme="dark" richColors />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
