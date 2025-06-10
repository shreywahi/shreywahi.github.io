import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Hero from '../components/Hero';
import About from '../components/About';
import Experience from '../components/Experience';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Certificates from '../components/Certificates';
import Contact from '../components/Contact';
import '../App.css';
// --- Firebase imports ---
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
// --- Centralized content ---
import {
  experiences as defaultExperiences,
  skillCategories as defaultSkillCategories,
  projects as defaultProjects,
  certs as defaultCerts,
  defaultHeroName,
  defaultHeroDesc,
  defaultAboutText,
  defaultContactHeading,
  defaultContactIntro,
} from '../components/content';

// --- Firebase config (replace with your own config) ---
const firebaseConfig = {
  apiKey: "AIzaSyDZapUFZ9iMMg0V3AloagwlwVmltiV-VUk",
  authDomain: "my-portfolio-758ad.firebaseapp.com",
  projectId: "my-portfolio-758ad",
  storageBucket: "my-portfolio-758ad.firebasestorage.app",
  messagingSenderId: "441895330074",
  appId: "1:441895330074:web:992b67a5393d5d98754ca3",
  measurementId: "G-X6RLKPR6SY"
  // ...other config...
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Index = () => {
  // Initialize with a function to ensure localStorage is read only once on mount
  const getInitialSection = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeSection') || 'hero';
    }
    return 'hero';
  };
  
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [fade, setFade] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth > 1024);
  
  // Keep a stable reference to the current active section
  const activeSectionRef = useRef(activeSection);
  
  // Update ref when state changes
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  // --- Admin mode state using Firebase Auth ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- Centralized content state ---
  const [heroName, setHeroName] = useState(defaultHeroName);
  const [heroDesc, setHeroDesc] = useState(defaultHeroDesc);
  const [aboutText, setAboutText] = useState(defaultAboutText);
  const [categories, setCategories] = useState(defaultSkillCategories);
  const [experiences, setExperiences] = useState(defaultExperiences);
  const [projectList, setProjectList] = useState(defaultProjects);
  const [certList, setCertList] = useState(defaultCerts);
  const [contactHeading, setContactHeading] = useState(defaultContactHeading);
  const [contactIntro, setContactIntro] = useState(defaultContactIntro);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
      if (!user) {
        setShowLogin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save activeSection to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeSection', activeSection);
    }
  }, [activeSection]);

  // Add a ref to track if user has manually scrolled
  const userScrolledRef = useRef(false);
  
  // Handle resize with a stable reference to active section
  useEffect(() => {
    let resizeTimer;
    
    const handleResize = () => {
      // Clear any pending timers to avoid multiple rapid calls
      clearTimeout(resizeTimer);
      
      // Set a small delay to ensure we're not responding to every pixel change
      resizeTimer = setTimeout(() => {
        const wasDesktop = isDesktop;
        const nowDesktop = window.innerWidth > 1024;
        
        if (wasDesktop !== nowDesktop) {
          // Update isDesktop state first
          setIsDesktop(nowDesktop);
          
          // When switching to desktop, make sure we're showing the correct section
          if (!wasDesktop && nowDesktop) {
            // Force read from localStorage to ensure we have the latest value
            const currentSection = localStorage.getItem('activeSection') || 'hero';
            
            // Only update if needed
            if (currentSection !== activeSectionRef.current) {
              setActiveSection(currentSection);
            }
            
            // Reset user scroll flag when transitioning
            userScrolledRef.current = false;
            
            // Then scroll to it after a small delay to ensure DOM is updated
            setTimeout(() => {
              const el = document.getElementById(currentSection);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }
      }, 50);
    };
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDesktop]); // Only depend on isDesktop to avoid loops

  // Scroll to active section when desktop changes or section changes
  // But only for programmatic navigation, not for scroll tracking
  useEffect(() => {
    if (isDesktop && typeof window !== 'undefined' && !userScrolledRef.current) {
      const el = document.getElementById(activeSection);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [isDesktop, activeSection]);

  // Handler for navigation (pass to Sidebar)
  const handleNavigate = (sectionId) => {
    // When user clicks navigation, we reset the scroll flag
    // because this is intentional navigation, not scroll tracking
    userScrolledRef.current = false;
    
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
    {
      id: "hero",
      component: (
        <Hero
          onNavigate={handleNavigate}
          isAdmin={isAdmin}
          heroName={heroName}
          setHeroName={setHeroName}
          heroDesc={heroDesc}
          setHeroDesc={setHeroDesc}
        />
      ),
    },
    {
      id: "about",
      component: (
        <About
          isAdmin={isAdmin}
          aboutText={aboutText}
          setAboutText={setAboutText}
        />
      ),
    },
    {
      id: "experience",
      component: (
        <Experience
          isAdmin={isAdmin}
          experiences={experiences}
          setExperiences={setExperiences}
        />
      ),
    },
    {
      id: "skills",
      component: (
        <Skills
          isAdmin={isAdmin}
          categories={categories}
          setCategories={setCategories}
        />
      ),
    },
    {
      id: "projects",
      component: (
        <Projects
          onSectionChange={setActiveSection}
          isAdmin={isAdmin}
          projectList={projectList}
          setProjectList={setProjectList}
        />
      ),
    },
    {
      id: "certs",
      component: (
        <Certificates
          onSectionChange={setActiveSection}
          isAdmin={isAdmin}
          certList={certList}
          setCertList={setCertList}
        />
      ),
    },
    {
      id: "contact",
      component: (
        <Contact
          isAdmin={isAdmin}
          heading={contactHeading}
          setHeading={setContactHeading}
          intro={contactIntro}
          setIntro={setContactIntro}
        />
      ),
    },
  ];

  // Find current section
  const currentSection = sections.find(s => s.id === activeSection)?.component;

  // --- Admin login form using Firebase Auth ---
  const renderAdminLogin = () => (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(30, 41, 59, 0.85)", // dark blue overlay
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <form
        onSubmit={async e => {
          e.preventDefault();
          setLoginError("");
          try {
            await signInWithEmailAndPassword(auth, email, password);
            setShowLogin(false);
            setEmail("");
            setPassword("");
          } catch (err) {
            setLoginError("Incorrect email or password");
          }
        }}
        style={{
          background: "linear-gradient(135deg, #fff 60%, #dbeafe 100%)", // light blue gradient
          color: "#1e293b",
          padding: 36,
          borderRadius: 18,
          minWidth: 340,
          boxShadow: "0 8px 40px #0006",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{
          color: "#2563eb",
          fontWeight: 700,
          fontSize: 28,
          marginBottom: 18,
          letterSpacing: 1,
        }}>Admin Login</h2>
        <input
          type="email"
          placeholder="Enter admin email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            margin: "10px 0",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            fontSize: 16,
            background: "#f1f5f9",
          }}
        />
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            margin: "10px 0",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            fontSize: 16,
            background: "#f1f5f9",
          }}
        />
        {loginError && <div style={{ color: "#dc2626", marginBottom: 10 }}>{loginError}</div>}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            style={{
              padding: "10px 24px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px #2563eb22",
              transition: "background 0.2s",
            }}
          >
            Login
          </button>
          <button
            type="button"
            style={{
              padding: "10px 24px",
              background: "#e5e7eb",
              color: "#1e293b",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onClick={() => setShowLogin(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  // Remove scroll snap for natural scrolling and restore section tracking only
  useEffect(() => {
    if (!isDesktop) return;

    const sectionIds = ["hero", "about", "experience", "skills", "projects", "certs", "contact"];
    
    // Add a wheel event listener to detect user scrolling
    const handleWheel = () => {
      userScrolledRef.current = true;
    };
    
    const handleScroll = () => {
      // Only track sections if user has scrolled
      if (!userScrolledRef.current) return;
      
      let found = false;
      for (let id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.2) {
            if (activeSection !== id) setActiveSection(id);
            found = true;
            break;
          }
        }
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleWheel, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleWheel);
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line
  }, [isDesktop, activeSection]);

  // Section tracking for sidebar (desktop only) using Intersection Observer
  useEffect(() => {
    if (!isDesktop) return;

    const sectionIds = ["hero", "about", "experience", "skills", "projects", "certs", "contact"];
    const sectionElements = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (sectionElements.length === 0) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        // Only update based on intersection if user has scrolled
        if (!userScrolledRef.current) return;
        
        // Find all intersecting entries
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const topSection = visible[0].target.id;
          if (topSection && topSection !== activeSection) {
            setActiveSection(topSection);
          }
        }
      },
      {
        root: null,
        threshold: 0.3, // 30% of section visible
      }
    );

    sectionElements.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line
  }, [isDesktop, /* do not depend on activeSection here */]);

  return (
    <div className={isDesktop ? "flex flex-row min-h-screen" : ""}>
      <Sidebar
        onNavigate={handleNavigate}
        activeSection={activeSection}
        setShowLogin={setShowLogin}
        isAdmin={isAdmin}
        signOut={signOut}
        auth={auth}
      />
      {showLogin && renderAdminLogin()}
      {isDesktop ? (
        <main
          className="flex-1 w-full ml-0 lg:ml-64 transition-all duration-300 overflow-y-auto"
          style={{ minHeight: '100vh', height: '100vh' }}
        >
          {/* Remove scroll snap classes */}
          <div>
            {sections.map(({ id, component }) => (
              <section id={id} key={id} className="min-h-screen">
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