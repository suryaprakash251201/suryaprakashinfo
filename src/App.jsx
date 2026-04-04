import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/sections/Navbar';
import BlogHeader from './components/sections/BlogHeader';
import Footer from './components/sections/Footer';
import Chatbot from './components/ui/Chatbot';
import HomePage from './pages/HomePage';
import BlogList from './pages/blog/BlogList';
import BlogPost from './pages/blog/BlogPost';
import AdminDashboard from './pages/admin/AdminDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

const ScrollProgress = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });
    const MotionDiv = motion.div;

    return (
        <MotionDiv
            className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-500 to-red-600 origin-left z-50 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
            style={{ scaleX }}
        />
    );
};

// Extracted AppLayout to access router context via useLocation
const AppLayout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isAdminPage = location.pathname.startsWith('/admin');
    const showPublicShell = !isAdminPage;

    return (
        <div className="bg-slate-50 dark:bg-[#0b0c10] min-h-screen text-slate-800 dark:text-slate-300 font-sans transition-colors duration-300 relative overflow-x-hidden pb-24 md:pb-0">
            <ScrollProgress />
            {showPublicShell && isHomePage && <Navbar />}
            {showPublicShell && !isHomePage && <BlogHeader />}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
            {showPublicShell && <Footer />}
            {showPublicShell && isHomePage && <Chatbot />}
        </div>
    );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
            <AppLayout />
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
