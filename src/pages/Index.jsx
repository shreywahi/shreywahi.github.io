import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Hero from '../components/Hero';
import About from '../components/About';
import Experience from '../components/Experience';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Certificates from '../components/Certificates';
import Contact from '../components/Contact';
import '../App.css'; // Import the CSS file for fade effects

const Index = () => {
  // Read last section from localStorage or default to 'hero'
  const getInitialSection = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeSection') || 'hero';
    }
    return 'hero';
  };
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [fade, setFade] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth > 1024);

  // Save activeSection to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeSection', activeSection);
    }
  }, [activeSection]);

  // Responsive layout: update isDesktop on resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024);
      // On resize, scroll to the correct section if desktop
      if (window.innerWidth > 1024) {
        setTimeout(() => {
          const el = document.getElementById(activeSection);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 0);
      }
    };
    window.addEventListener('resize', handleResize);
    // Set initial value
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSection]);

  // On mount or when isDesktop changes, scroll to the correct section if desktop
  useEffect(() => {
    if (isDesktop && typeof window !== 'undefined') {
      const el = document.getElementById(activeSection);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [isDesktop, activeSection]);

  // Handler for navigation (pass to Sidebar)
  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    if (isDesktop) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setFade(false);
      setTimeout(() => {
        setActiveSection(sectionId);
        setFade(true);
      }, 300); // match fade duration
    }
  };

  // Section mapping (must be inside component to access handleNavigate)
  const sections = [
    { id: "hero", component: <Hero onNavigate={handleNavigate} /> },
    { id: "about", component: <About /> },
    { id: "experience", component: <Experience /> },
    { id: "skills", component: <Skills /> },
    { id: "projects", component: <Projects onSectionChange={setActiveSection} /> },
    { id: "certs", component: <Certificates onSectionChange={setActiveSection} /> },
    { id: "contact", component: <Contact /> },
  ];

  // Find current section
  const currentSection = sections.find(s => s.id === activeSection)?.component;

  return (
    <div className={isDesktop ? "flex flex-row min-h-screen" : ""}>
      <Sidebar onNavigate={handleNavigate} activeSection={activeSection} />
      {isDesktop ? (
        <main
          className="flex-1 w-full ml-0 lg:ml-64 transition-all duration-300 overflow-y-auto"
          style={{ minHeight: '100vh', height: '100vh' }}
        >
          <div>
            {sections.map(({ id, component }) => (
              <section id={id} key={id} className="snap-start min-h-screen">
                {component}
              </section>
            ))}
          </div>
        </main>
      ) : (
        <div className="ml-0 lg:ml-64 transition-all duration-300">
          <div className={`fade-section ${fade ? 'fade-in' : 'fade-out'}`}>{currentSection}</div>
        </div>
      )}
    </div>
  );
};

export default Index;