import { useEffect, useState } from 'react';
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

  return (
    <div className={isDesktop ? "flex flex-row min-h-screen" : ""}>
      <Sidebar onNavigate={handleNavigate} activeSection={activeSection} />
      <button
        style={{
          position: "fixed", top: 12, right: 12, zIndex: 1000,
          background: isAdmin ? "#e53e3e" : "#3182ce", color: "#fff",
          border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer"
        }}
        onClick={() => {
          if (isAdmin) {
            signOut(auth);
          } else {
            setShowLogin(true);
          }
        }}
      >
        {isAdmin ? "Exit Admin" : "Admin Login"}
      </button>
      {showLogin && renderAdminLogin()}
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