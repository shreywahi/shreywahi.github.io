import { useEffect, useState, useRef, Suspense, lazy } from 'react';
import Sidebar from '../components/Sidebar';
import CosmicBackground from '../components/CosmicBackground';
import Hero from '../components/Hero';
import About from '../components/About';
import Experience from '../components/Experience';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Certificates from '../components/Certificates';
import Contact from '../components/Contact';
// Lazy load AdminPanel since it's only used by admin users
const AdminPanel = lazy(() => import('../components/AdminPanel'));
import '../App.css';
// --- Firebase imports ---
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
// --- Centralized content ---
import { useContentManager } from '../hooks/useContentManager';
// --- Device detection for initial view mode ---
import { getDeviceType } from '../utils/deviceDetection';

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
  // 'desktop' = sidebar view, 'mobile' = bottom nav view
  // Detect device type on initialization, then allow user override
  const getInitialViewMode = () => {
    if (typeof window === 'undefined') return 'desktop';
    const savedViewMode = localStorage.getItem('userViewMode');
    if (savedViewMode && (savedViewMode === 'desktop' || savedViewMode === 'mobile')) {
      return savedViewMode;
    }
    const deviceType = getDeviceType();
    return deviceType === 'desktop' ? 'desktop' : 'mobile';
  };
  
  const [viewMode, setViewMode] = useState(getInitialViewMode);
  const isDesktopView = viewMode === 'desktop';
  
  // Sidebar collapse state for desktop view (default to collapsed when desktop)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => (isDesktopView ? true : false));
  
  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem('userViewMode', newViewMode);
  };
  const handleSidebarCollapseChange = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const activeSectionRef = useRef(activeSection);
  
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
  const { 
    content, 
    updateContent,
    loading
  } = useContentManager(isAdmin);
  
  const [heroName, setHeroName] = useState('');
  const [heroDesc, setHeroDesc] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [categories, setCategories] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [certList, setCertList] = useState([]);
  const [contactHeading, setContactHeading] = useState('');
  const [contactIntro, setContactIntro] = useState('');

  const userScrolledRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Update state when content loads
  useEffect(() => {
    if (!loading && content) {
      setHeroName(content.hero?.name || '');
      setHeroDesc(content.hero?.description || '');
      setAboutText(content.about?.text || '');
      setCategories(content.skillCategories || []);
      setExperiences(content.experiences || []);
      setProjectList(content.projects || []);
      setCertList(content.certificates || []);
      setContactHeading(content.contact?.heading || '');
      setContactIntro(content.contact?.intro || '');
    }
  }, [content, loading]);

  // Listen to Firebase auth state and auto-logout on page refresh
  useEffect(() => {
    signOut(auth).catch(() => {});
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
      if (!user) {
        setShowLogin(false);
      }
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeSection', activeSection);
    }
  }, [activeSection]);

  useEffect(() => {
    const currentSection = localStorage.getItem('activeSection') || 'hero';
    if (isDesktopView && currentSection !== activeSectionRef.current) {
      setActiveSection(currentSection);
      setTimeout(() => {
        const el = document.getElementById(currentSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (!isDesktopView) return;
    const sectionIds = ["hero", "about", "experience", "skills", "projects", "certs", "contact"];
    let scrollContainer = null;
    const initializeScrollContainer = () => {
      scrollContainer = document.getElementById('main-scroll-container');
      return scrollContainer;
    };
    const initializeScrollPosition = () => {
      const savedSection = localStorage.getItem('activeSection');
      if (savedSection && savedSection !== activeSection) {
        setActiveSection(savedSection);
      }
      if (savedSection && savedSection !== 'hero') {
        const el = document.getElementById(savedSection);
        if (el) {
          el.scrollIntoView({ behavior: 'auto' });
        }
      }
    };
    const updateActiveSection = () => {
      if (isNavigatingRef.current) return;
      let currentSection = null;
      if (!scrollContainer) return;
      const containerRect = scrollContainer.getBoundingClientRect();
      const viewportHeight = containerRect.height;
      for (let id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const relativeTop = rect.top - containerRect.top;
          const relativeBottom = rect.bottom - containerRect.top;
          if (relativeTop <= viewportHeight * 0.6 && relativeBottom > viewportHeight * 0.2) {
            currentSection = id;
            break;
          }
        }
      }
      if (!currentSection) {
        for (let id of sectionIds) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            const relativeTop = rect.top - containerRect.top;
            const relativeBottom = rect.bottom - containerRect.top;
            if (relativeBottom > 100 && relativeTop < viewportHeight - 100) {
              currentSection = id;
              break;
            }
          }
        }
      }
      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };
    const handleScroll = () => {
      updateActiveSection();
    };
    const handleWheel = () => {
      userScrolledRef.current = true;
    };
    const timer = setTimeout(() => {
      if (initializeScrollContainer()) {
        initializeScrollPosition();
        updateActiveSection();
        handleWheel();
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('wheel', handleWheel, { passive: true });
        window.addEventListener('touchmove', handleWheel, { passive: true });
      } else {
        setTimeout(() => {
          if (initializeScrollContainer()) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('wheel', handleWheel, { passive: true });
            window.addEventListener('touchmove', handleWheel, { passive: true });
            updateActiveSection();
          }
        }, 500);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleWheel);
    };
  }, [isDesktopView, loading]);

  const handleNavigate = (sectionId) => {
    isNavigatingRef.current = true;
    setActiveSection(sectionId);
    if (isDesktopView) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          isNavigatingRef.current = false;
          userScrolledRef.current = true;
        }, 500);
      }
    } else {
      setFade(false);
      setTimeout(() => {
        setActiveSection(sectionId);
        setFade(true);
        isNavigatingRef.current = false;
      }, 300);
    }
  };

  const updateHero = async (name, desc) => {
    const updated = await updateContent('hero', { 
      ...content.hero, 
      name: name !== undefined ? name : heroName, 
      description: desc !== undefined ? desc : heroDesc 
    });
    if (updated) {
      if (name !== undefined) setHeroName(name);
      if (desc !== undefined) setHeroDesc(desc);
    }
  };

  const sections = [
    {
      id: "hero",
      component: (
        <Hero
          onNavigate={handleNavigate}
          isAdmin={isAdmin}
          heroName={heroName}
          heroDesc={heroDesc}
          updateHero={updateHero}
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
          updateContent={updateContent}
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
          updateContent={updateContent}
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
          updateContent={updateContent}
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

  const currentSection = sections.find(s => s.id === activeSection)?.component;

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

  // Main component render
  return (
  <div className={`${isDesktopView ? "flex flex-row min-h-screen" : ""} w-full overflow-x-hidden relative`} style={{ minWidth: '320px', zIndex: 1 }}>
      {/* Global fixed cosmic background */}
      <CosmicBackground />
      {/* Floating Admin Panel open button (desktop only) */}
      {isDesktopView && isAdmin && !showAdminPanel && (
        <button
          onClick={() => setShowAdminPanel(true)}
          className="fixed top-8 right-8 z-50 bg-blue-700 hover:bg-blue-800 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Open Admin Panel"
        >
          ⚙️
        </button>
      )}      <Sidebar
        onNavigate={handleNavigate}
        activeSection={activeSection}
        setShowLogin={setShowLogin}        isAdmin={isAdmin}
        signOut={signOut}
        auth={auth}
        content={content}
        loading={loading}
        onViewModeChange={handleViewModeChange}
        viewMode={viewMode}
        onSidebarCollapseChange={handleSidebarCollapseChange}
        initialCollapsed={true}
      />
      {showLogin && renderAdminLogin()}
        <Suspense fallback={<div></div>}>
        {isDesktopView && isAdmin && showAdminPanel && (
          <AdminPanel
            isAdmin={isAdmin}
            content={content}
            loading={loading}
            screenSize={viewMode}
            onClose={() => setShowAdminPanel(false)}
          />
        )}{/* Mobile/tablet: AdminPanel functionality is integrated into Sidebar popup menu */}
      </Suspense>
        {isDesktopView ? (        
          <main
            id="main-scroll-container"
            className={`responsive-content main-content-responsive flex-1 w-full transition-all duration-300 overflow-y-auto overflow-x-hidden`}
            style={{ 
              minHeight: '100vh', 
              height: '100vh',
              minWidth: 0,
              marginLeft: isDesktopView ? 
                (sidebarCollapsed ? '80px' : '208px') : '0',
            }}
          >
          {/* Remove scroll snap classes */}
          <div className="w-full min-w-0">
            {sections.map(({ id, component }) => (
              <section id={id} key={id} className="min-h-screen w-full">
                {component}
              </section>
            ))}
          </div>
        </main>
      ) : (
        <div className={`transition-all duration-300 w-full min-w-0`} style={{ marginLeft: 0 }}>
          <div className={`fade-section ${fade ? 'fade-in' : 'fade-out'} w-full`}>{currentSection}</div>
        </div>
      )}
    </div>
  );
};

export default Index;