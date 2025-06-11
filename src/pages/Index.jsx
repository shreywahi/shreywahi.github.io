import { useEffect, useState, useRef, Suspense, lazy } from 'react';
import Sidebar from '../components/Sidebar';
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
import { logCspSuggestion } from '../utils/cspHelper';

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

const Index = ({ driveInitialized = false, driveError = null }) => {
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
  
  // Add screen size detection similar to Sidebar
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      if (w <= 640) return 'mobile';
      else if (w <= 1024) return 'tablet';
      else return 'desktop';
    }
    return 'desktop';
  });
  
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
  const [password, setPassword] = useState("");  // --- Centralized content state ---
  const { content, updateContent, saveContentToDrive, reloadFromDrive, loading } = useContentManager(isAdmin); // `content` is the state from the hook
  
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
  }, [content, loading]);

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

  // Admin panel functions
  const [loadingFromDrive, setLoadingFromDrive] = useState(false);
  const [usingLocalContent, setUsingLocalContent] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('useLocalContent') === 'true';
    }
    return false;
  });

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
    console.log('Index: Switching to local content');
    
    try {
      // Enable local content mode
      const { toggleLocalContentMode } = await import('../utils/driveContentManager');
      toggleLocalContentMode(true);
      setUsingLocalContent(true);
      
      // Force reload to use local content
      window.location.reload();
    } catch (error) {
      console.error('Error switching to local content:', error);
      alert('Failed to switch to local content: ' + error.message);
    }
  };

  const handleSwitchToDrive = async () => {
    console.log('Index: Switching back to Drive content');
    
    try {
      // Disable local content mode
      const { toggleLocalContentMode } = await import('../utils/driveContentManager');
      toggleLocalContentMode(false);
      setUsingLocalContent(false);
      
      // Force reload to try Drive content again
      window.location.reload();
    } catch (error) {
      console.error('Error switching to Drive content:', error);
      alert('Failed to switch to Drive content: ' + error.message);
    }
  };

  const handleReset = async () => {
    console.log('Index: Resetting Drive content cache');
    
    try {
      // Clear all content-related localStorage
      localStorage.removeItem('cachedContent');
      localStorage.removeItem('contentCacheTime');
      localStorage.removeItem('useLocalContent');
      
      // Reset drive content manager flags
      const { resetContentState } = await import('../utils/driveContentManager');
      const { resetDriveMode } = await import('../utils/contentLoader');
      resetContentState();
      
      await resetDriveMode();
      
      // Set a flag to indicate we want to load from Drive on next load
      localStorage.setItem('loadFromDriveOnStart', 'true');
      
      // Force reload
      window.location.reload();
    } catch (e) {
      console.error('Error resetting Drive mode:', e);
      // Set the flag even if reset fails, then reload
      localStorage.setItem('loadFromDriveOnStart', 'true');
      window.location.reload();
    }
  };

  // Save activeSection to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeSection', activeSection);
    }
  }, [activeSection]);
  // Handle resize with a stable reference to active section
  useEffect(() => {
    let resizeTimer;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      
      resizeTimer = setTimeout(() => {
        const wasDesktop = isDesktop;
        const nowDesktop = window.innerWidth > 1024;
        
        // Update screen size
        const w = window.innerWidth;
        const newScreenSize = w <= 640 ? 'mobile' : w <= 1024 ? 'tablet' : 'desktop';
        setScreenSize(newScreenSize);
        
        if (wasDesktop !== nowDesktop) {
          setIsDesktop(nowDesktop);
          
          if (!wasDesktop && nowDesktop) {
            const currentSection = localStorage.getItem('activeSection') || 'hero';
            
            if (currentSection !== activeSectionRef.current) {
              setActiveSection(currentSection);
            }
            
            setTimeout(() => {
              const el = document.getElementById(currentSection);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }
      }, 50);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDesktop]);  // Single unified scroll tracking effect
  useEffect(() => {
    if (!isDesktop) return;

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
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleWheel);
    };
  }, [isDesktop, loading]);

  // Add CSP logging on mount - ALWAYS call this hook
  useEffect(() => {
    setTimeout(() => {
      logCspSuggestion();
    }, 2000);
  }, []);
  // Handler for navigation (pass to Sidebar)
  const handleNavigate = (sectionId) => {
    // Set navigation flag to prevent scroll tracking during navigation
    isNavigatingRef.current = true;
    
    setActiveSection(sectionId);
    
    if (isDesktop) {
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
  };
  
  // Update the loading indicator with a better fallback
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-950 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading content...</p>
        </div>
      </div>
    );
  }

  // Rest of your component...
  // Modify the return statement to include the new components
  return (
    <div className={isDesktop ? "flex flex-row min-h-screen" : ""}>      <Sidebar
        onNavigate={handleNavigate}
        activeSection={activeSection}
        setShowLogin={setShowLogin}
        isAdmin={isAdmin}
        signOut={signOut}
        auth={auth}
        // Admin panel props
        reloadFromDrive={reloadFromDrive}
        saveContentToDrive={saveContentToDriveHandler}
        driveSaving={driveSaving}
        loadingFromDrive={loadingFromDrive}
        usingLocalContent={usingLocalContent}
        handleSwitchToLocal={handleSwitchToLocal}
        handleSwitchToDrive={handleSwitchToDrive}
        handleReset={handleReset}
        handleLoadFromDrive={handleLoadFromDrive}
      />{showLogin && renderAdminLogin()}      <Suspense fallback={<div></div>}>
        <AdminPanel 
          isAdmin={isAdmin} 
          reloadFromDrive={reloadFromDrive} 
          saveContentToDrive={saveContentToDriveHandler}
          driveSaving={driveSaving}
          driveMessage={driveMessage}
          screenSize={screenSize}
          // Admin functions
          loadingFromDrive={loadingFromDrive}
          usingLocalContent={usingLocalContent}
          handleSwitchToLocal={handleSwitchToLocal}
          handleSwitchToDrive={handleSwitchToDrive}
          handleReset={handleReset}
          handleLoadFromDrive={handleLoadFromDrive}
        />
      </Suspense>
      
      {isDesktop ? (        <main
          id="main-scroll-container"
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