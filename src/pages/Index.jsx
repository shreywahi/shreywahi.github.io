import { useEffect, useState, useRef, Suspense, lazy } from 'react';
import Sidebar from '../components/Sidebar';
import Hero from '../components/Hero';
import About from '../components/About';
import Experience from '../components/Experience';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Certificates from '../components/Certificates';
import Contact from '../components/Contact';
import LoadingScreen from '../components/LoadingScreen';
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
  const [fade, setFade] = useState(true);  // Simple view mode system with device detection for initial state
  // 'desktop' = sidebar view, 'mobile' = bottom nav view
  // Detect device type on initialization, then allow user override
  const getInitialViewMode = () => {
    if (typeof window === 'undefined') return 'desktop';
    
    // Check if user has previously overridden the view mode
    const savedViewMode = localStorage.getItem('userViewMode');
    if (savedViewMode && (savedViewMode === 'desktop' || savedViewMode === 'mobile')) {
      return savedViewMode;
    }
    
    // Use device detection for initial view mode
    const deviceType = getDeviceType();
    return deviceType === 'desktop' ? 'desktop' : 'mobile';
  };
  
  const [viewMode, setViewMode] = useState(getInitialViewMode);
  const isDesktopView = viewMode === 'desktop';
  
  // Sidebar collapse state for desktop view
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Handle view mode changes from Sidebar and save user preference
  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    // Save user preference to override device detection in future visits
    localStorage.setItem('userViewMode', newViewMode);
  };
  // Handle sidebar collapse changes
  const handleSidebarCollapseChange = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };

  // For responsive main content layout
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Keep a stable reference to the current active section
  const activeSectionRef = useRef(activeSection);
  
  // Update ref when state changes
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);  // --- Admin mode state using Firebase Auth ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");// --- Centralized content state ---
  const { 
    content, 
    updateContent, 
    saveContentToDrive, 
    reloadFromDrive, 
    loadLocalContent,
    loadContentFromDrive,
    loading, 
    loadingStep 
  } = useContentManager(isAdmin, false); // Don't auto-load, let LoadingScreen control it
  
  const [heroName, setHeroName] = useState('');
  const [heroDesc, setHeroDesc] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [categories, setCategories] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [certList, setCertList] = useState([]);
  const [contactHeading, setContactHeading] = useState('');
  const [contactIntro, setContactIntro] = useState('');
  
  // Add new state for drive operations - ALWAYS declare these
  const [driveSaving, setDriveSaving] = useState(false);
  const [driveMessage, setDriveMessage] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);
  // Add a ref to track if user has manually scrolled
  const userScrolledRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Update state when content loads from useContentManager
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
  }, [content, loading]);  // Listen to Firebase auth state and auto-logout on page refresh
  useEffect(() => {
    // Force logout on page refresh/reload by clearing Firebase auth state
    signOut(auth).catch(() => {}); // Ignore errors if already logged out
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
      if (!user) {
        setShowLogin(false);
      }
    });
    return () => unsubscribe();
  }, []);
  // Admin panel functions
  const [loadingFromDrive, setLoadingFromDrive] = useState(false);
  
  // Note: usingLocalContent is no longer used since we always try Drive first
  const [usingLocalContent, setUsingLocalContent] = useState(false);

  const handleLoadFromDrive = async () => {
    console.log('Index: Loading latest content from Drive');
    setLoadingFromDrive(true);
    
    try {
      if (reloadFromDrive) {
        // Use the hook's reload function if available
        const success = await reloadFromDrive();
        if (success) {
          console.log('Successfully reloaded content from Drive');
        } else {
          throw new Error('Failed to reload content');
        }
      } else {
        // Fallback to direct load and reload
        const { loadContentFromDrive } = await import('../utils/contentLoader');
        await loadContentFromDrive();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error loading from Drive:', error);
      alert('Failed to load content from Drive: ' + error.message);
    } finally {
      setLoadingFromDrive(false);
    }
  };
  const handleSwitchToLocal = async () => {
    console.log('Index: Refreshing to load fresh content');
    try {
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing page:', error);
      alert('Failed to refresh page: ' + (error && error.message ? error.message : JSON.stringify(error)));
    }
  };

  const handleSwitchToDrive = async () => {
    console.log('Index: Refreshing to load fresh content');
    
    try {
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing page:', error);
      alert('Failed to refresh page: ' + error.message);
    }
  };

  const handleReset = async () => {
    console.log('Index: Refreshing to reload content');
    
    try {
      window.location.reload();
    } catch (e) {
      console.error('Error refreshing page:', e);
      window.location.reload();
    }
  };

  // Save activeSection to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeSection', activeSection);
    }
  }, [activeSection]);  // Handle device type changes with a stable reference to active section
  useEffect(() => {
    // Keep activeSectionRef in sync for device type changes
    const currentSection = localStorage.getItem('activeSection') || 'hero';
      if (isDesktopView && currentSection !== activeSectionRef.current) {
      setActiveSection(currentSection);
      
      setTimeout(() => {
        const el = document.getElementById(currentSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []); // Remove device type dependency

// Single unified scroll tracking effect
  useEffect(() => {
    if (!isDesktopView) return;

    const sectionIds = ["hero", "about", "experience", "skills", "projects", "certs", "contact"];
    let scrollContainer = null;    // Get the scrolling container (main element)
    const initializeScrollContainer = () => {
      scrollContainer = document.getElementById('main-scroll-container');
      return scrollContainer;
    };
    
    // Initialize scroll position after page refresh
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
      // Track which section is currently in view
    const updateActiveSection = () => {
      if (isNavigatingRef.current) return;
      
      let currentSection = null;
      
      if (!scrollContainer) return;
      
      // Get the container's viewport
      const containerRect = scrollContainer.getBoundingClientRect();
      const viewportHeight = containerRect.height;
      
      // Find the section that's most visible in the container viewport
      for (let id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Calculate relative position to the container
          const relativeTop = rect.top - containerRect.top;
          const relativeBottom = rect.bottom - containerRect.top;
          
          // If section is in the top 60% of the container viewport, it's active
          if (relativeTop <= viewportHeight * 0.6 && relativeBottom > viewportHeight * 0.2) {
            currentSection = id;
            break;
          }
        }
      }
      
      // Fallback: if no section found, use the one that's most visible
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
      // Initialize after content loads
    const timer = setTimeout(() => {
      // Initialize the scroll container
      if (initializeScrollContainer()) {
        initializeScrollPosition();
        updateActiveSection();
        // Enable scroll tracking immediately
        userScrolledRef.current = true;
        
        // Attach listeners to the correct scroll container
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        
        // Wheel and touch events still go on window for broader capture
        window.addEventListener('wheel', handleWheel, { passive: true });
        window.addEventListener('touchmove', handleWheel, { passive: true });
      } else {
        // Retry if container not found yet
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
      
      // Clean up from scroll container
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('wheel', handleWheel);      window.removeEventListener('touchmove', handleWheel);
    };
  }, [isDesktopView, loading]);

  // Handler for navigation (pass to Sidebar)
  const handleNavigate = (sectionId) => {
    // Set navigation flag to prevent scroll tracking during navigation
    isNavigatingRef.current = true;
    
    setActiveSection(sectionId);
    
    if (isDesktopView) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
          // Re-enable scroll tracking after navigation completes
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
  // Create wrapped update functions
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
  
  const updateAbout = async (text) => {
    const updated = await updateContent('about', { ...content.about, text });
    if (updated) setAboutText(text);
  };

  // Section mapping (must be inside component to access handleNavigate)
  const sections = [
    {
      id: "hero",      component: (        <Hero
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
    },    {
      id: "skills",
      component: (
        <Skills
          isAdmin={isAdmin}
          categories={categories}
          setCategories={setCategories}
          updateContent={updateContent}
          saveContentToDrive={saveContentToDrive}
        />
      ),
    },    {
      id: "projects",
      component: (
        <Projects
          onSectionChange={setActiveSection}
          isAdmin={isAdmin}
          projectList={projectList}
          setProjectList={setProjectList}
          updateContent={updateContent}
          saveContentToDrive={saveContentToDrive}
        />
      ),
    },    {
      id: "certs",
      component: (
        <Certificates
          onSectionChange={setActiveSection}
          isAdmin={isAdmin}
          certList={certList}
          setCertList={setCertList}
          updateContent={updateContent}
          saveContentToDrive={saveContentToDrive}
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
  // Function to save content to Google Drive
  const saveContentToDriveHandler = async () => {
    if (!isAdmin) return;
    
    try {
      setDriveSaving(true);
      setDriveMessage({ type: 'info', text: 'Saving content to Google Drive...' });
      
      const success = await saveContentToDrive();
      
      if (success) {
        setDriveMessage({ type: 'success', text: 'Content saved to Google Drive successfully!' });
        setTimeout(() => setDriveMessage(null), 3000);
      } else {
        setDriveMessage({ 
          type: 'error', 
          text: 'Failed to save to Google Drive. Please try again.' 
        });
        setTimeout(() => setDriveMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error saving to Drive:', error);
      setDriveMessage({ 
        type: 'error', 
        text: 'Failed to save to Google Drive: ' + (error.message || 'Unknown error') 
      });
      setTimeout(() => setDriveMessage(null), 5000);
    } finally {
      setDriveSaving(false);    }
  };
    // Message notification for drive operations
  const renderDriveMessage = () => {
    if (!driveMessage) return null;
    
    const bgColor = driveMessage.type === 'error' ? 'bg-red-500' : 
                   driveMessage.type === 'success' ? 'bg-green-500' : 
                   'bg-blue-500';
    
    return (
      <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white ${bgColor}`}>
        {driveMessage.text}
      </div>
    );
  };    // Enhanced loading screen with Drive attempt and fallback
  if (loading) {
    return <LoadingScreen onLoadLocal={loadLocalContent} onLoadDrive={loadContentFromDrive} />;
  }
    // Main component render
  return (    <div className={`${isDesktopView ? "flex flex-row min-h-screen" : ""} w-full overflow-x-hidden`} style={{ minWidth: '320px' }}>
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
        loadLocalContent={loadLocalContent}
        loadContentFromDrive={loadContentFromDrive}
        saveContentToDrive={saveContentToDriveHandler}
        driveSaving={driveSaving}
        loading={loading}
        onViewModeChange={handleViewModeChange}
        viewMode={viewMode}
        onSidebarCollapseChange={handleSidebarCollapseChange}
      />
      {showLogin && renderAdminLogin()}      <Suspense fallback={<div></div>}>        {isDesktopView && isAdmin && showAdminPanel && (
          <AdminPanel
            isAdmin={isAdmin}
            reloadFromDrive={reloadFromDrive}
            saveContentToDrive={saveContentToDriveHandler}
            driveSaving={driveSaving}
            driveMessage={driveMessage}
            screenSize={viewMode}
            content={content}
            loadLocalContent={loadLocalContent}
            loadContentFromDrive={loadContentFromDrive}
            loading={loading}
            onClose={() => setShowAdminPanel(false)}
          />
        )}{/* Mobile/tablet: AdminPanel functionality is integrated into Sidebar popup menu */}
      </Suspense>      {isDesktopView ? (        <main
          id="main-scroll-container"
          className={`responsive-content main-content-responsive flex-1 w-full transition-all duration-300 overflow-y-auto overflow-x-hidden`}style={{ 
            minHeight: '100vh', 
            height: '100vh',
            minWidth: 0,
            marginLeft: isDesktopView ? 
              (sidebarCollapsed ? '95px' : '205px') : '0',
            maxWidth: isDesktopView ? 
              (sidebarCollapsed ? 'calc(100vw - 95px)' : 'calc(100vw - 205px)') : '100vw',
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