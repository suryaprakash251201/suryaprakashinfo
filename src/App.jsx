import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/sections/Navbar';
import Footer from './components/sections/Footer';
import Chatbot from './components/ui/Chatbot';
import HomePage from './pages/HomePage';
import BlogList from './pages/blog/BlogList';
import BlogPost from './pages/blog/BlogPost';
import AdminDashboard from './pages/admin/AdminDashboard';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
            <div className="bg-slate-50 dark:bg-[#0b0c10] min-h-screen text-slate-800 dark:text-slate-300 font-sans transition-colors duration-300">
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/blog" element={<BlogList />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
            <Footer />
            <Chatbot />
            </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
