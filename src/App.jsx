import React from 'react';
import Navbar from './components/sections/Navbar';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Services from './components/sections/Services';
import Portfolio from './components/sections/Portfolio';
import Contact from './components/sections/Contact';
import Footer from './components/sections/Footer';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="bg-slate-50 dark:bg-[#0b0c10] min-h-screen text-slate-800 dark:text-slate-300 font-sans transition-colors duration-300">
          <Navbar />
          <main>
            <Hero />
            <About />
            <Services />
            <Portfolio />
            <Contact />
          </main>
          <Footer />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
