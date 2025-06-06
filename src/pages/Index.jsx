import { useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Hero from '../components/Hero';
import About from '../components/About';
import Experience from '../components/Experience';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Certificates from '../components/Certificates';
import Contact from '../components/Contact';
import '../App.css'; // Import the CSS file for fade effects

// Section mapping
const sections = [
  { id: "hero", component: <Hero /> },
  { id: "about", component: <About /> },
  { id: "experience", component: <Experience /> },
  { id: "skills", component: <Skills /> },
  { id: "projects", component: <Projects /> },
  { id: "certs", component: <Certificates /> },
  { id: "contact", component: <Contact /> },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const [fade, setFade] = useState(true);
  const sectionRefs = useRef({});

  // Handler for navigation (pass to Sidebar)
  const handleNavigate = (sectionId) => {
    setFade(false);
    setTimeout(() => {
      setActiveSection(sectionId);
      setFade(true);
      // Scroll to the section smoothly
      sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth' });
    }, 300); // match fade duration
  };

  return (
    <div>
      <Sidebar onNavigate={handleNavigate} />
      {/* Add responsive left margin to main content so sidebar never overlaps */}
      <div className="ml-0 lg:ml-64 transition-all duration-300 main-scroll">
        {sections.map(({ id, component }) => (
          <section
            key={id}
            id={id}
            ref={el => sectionRefs.current[id] = el}
            className={`snap-start ${id === activeSection ? `fade-section ${fade ? 'fade-in' : 'fade-out'}` : ''}`}
            style={{ minHeight: '100vh', width: '100%' }}
          >
            {component}
          </section>
        ))}
      </div>
    </div>
  );
};

export default Index;