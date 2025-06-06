import { useState } from 'react';
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

  // Handler for navigation (pass to Sidebar)
  const handleNavigate = (sectionId) => {
    setFade(false);
    setTimeout(() => {
      setActiveSection(sectionId);
      setFade(true);
    }, 300); // match fade duration
  };

  // Find current section
  const currentSection = sections.find(s => s.id === activeSection)?.component;

  return (
    <div>
      <Sidebar onNavigate={handleNavigate} />
      <div className={`fade-section ${fade ? 'fade-in' : 'fade-out'}`}>
        {currentSection}
      </div>
    </div>
  );
};

export default Index;