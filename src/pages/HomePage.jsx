import React from 'react';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Services from '../components/sections/Services';
import Portfolio from '../components/sections/Portfolio';
import Contact from '../components/sections/Contact';

const HomePage = () => {
    return (
        <main>
            <Hero />
            <About />
            <Services />
            <Portfolio />
            <Contact />
        </main>
    );
};

export default HomePage;
