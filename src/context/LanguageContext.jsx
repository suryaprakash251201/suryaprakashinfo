import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const translations = {
    en: {
        nav: { home: 'Home', about: 'About', services: 'Services', portfolio: 'Portfolio', contact: 'Contact', hire: 'Hire Me' },
        hero: { welcome: 'Welcome to my world', role_prefix: "I'm a", contact: 'Contact Me', view_work: 'View Work' },
        about: { title: 'About Me', subtitle: 'Mission: Secure The Future', description: 'I am a passionate Cybersecurity Researcher and Full Stack Developer dedicated to building robust, secure, and scalable digital infrastructures. With a deep understanding of penetration testing and threat analysis, I ensure that systems are not just functional, but fortified.' },
        services: { title: 'What I Do', subtitle: 'Technical Arsenal' },
        portfolio: { title: 'My Work', subtitle: 'Featured Projects', view_all: 'View All Projects' },
        contact: { title: 'Get In Touch', subtitle: "Let's Work Together", form: { name: 'Name', email: 'Email', subject: 'Subject', message: 'Message', send: 'Send Message' } }
    },
    ta: {
        nav: { home: 'முகப்பு', about: 'என்னைப் பற்றி', services: 'சேவைகள்', portfolio: 'படைப்புகள்', contact: 'தொடர்புக்கு', hire: 'என்னை நியமிக்கவும்' },
        hero: { welcome: 'எனது உலகிற்கு வரவேற்கிறேன்', role_prefix: 'நான் ஒரு', contact: 'தொடர்பு கொள்ள', view_work: 'பணிகளைப் பார்' },
        about: { title: 'என்னைப் பற்றி', subtitle: 'இலக்கு: எதிர்காலத்தைப் பாதுகாத்தல்', description: 'நான் ஒரு ஆர்வமுள்ள இணையப் பாதுகாப்பு ஆராய்ச்சியாளர் மற்றும் முழு அடுக்கு டெவலப்பர். வலுவான, பாதுகாப்பான மற்றும் அளவிடக்கூடிய டிஜிட்டல் உள்கட்டமைப்புகளை உருவாக்குவதில் அர்ப்பணிப்புடன் உள்ளேன். ஊடுருவல் சோதனை மற்றும் அச்சுறுத்தல் பகுப்பாய்வில் ஆழ்ந்த புரிதலுடன், அமைப்புகள் செயல்படுவது மட்டுமல்லாமல், பாதுகாப்பாகவும் இருப்பதை உறுதி செய்கிறேன்.' },
        services: { title: 'நான் செய்வது என்ன', subtitle: 'தொழில்நுட்ப ஆயுதங்கள்' },
        portfolio: { title: 'எனது பணிகள்', subtitle: 'சிறப்பு திட்டங்கள்', view_all: 'அனைத்தையும் பார்' },
        contact: { title: 'தொடர்பில் இருங்கள்', subtitle: 'இணைந்து பணியாற்றுவோம்', form: { name: 'பெயர்', email: 'மின்னஞ்சல்', subject: 'பொருள்', message: 'செய்தி', send: 'செய்தியை அனுப்பு' } }
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const t = translations[language];

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ta' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
