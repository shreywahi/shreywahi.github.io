import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Github, Linkedin, Mail, Sun, Moon, Home, Folder, Mail as MailIcon } from 'lucide-react';
import { useTheme } from "next-themes";

const navLinks = [
	{ label: 'Home', section: 'hero' },
	{ label: 'About', section: 'about' },
	{ label: 'Experience', section: 'experience' },
	{ label: 'Skills', section: 'skills' },
	{ label: 'Projects', section: 'projects' },
	{ label: 'Certificates', section: 'certs' },
	{ label: 'Contact', section: 'contact' }
];

const socialLinks = [
	{
		href: 'https://github.com/dodoshrey',
		icon: Github,
		label: 'GitHub',
	},
	{
		href: 'https://www.linkedin.com/in/shrey-wahi/',
		icon: Linkedin,
		label: 'LinkedIn',
	},
	{
		href: 'mailto:wahishrey@gmail.com',
		icon: Mail,
		label: 'Email',
	},
];

// Sidebar open button component
const SidebarOpenButton = React.forwardRef(({ className, onClick }, ref) => (
    <button
        ref={ref}
        className={`fixed bottom-6 left-6 z-50 bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
        onClick={onClick}
        aria-label="Open sidebar"
        tabIndex={0}
    >
        <Menu size={28} />
    </button>
));

const Sidebar = ({ onNavigate }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const sidebarRef = useRef(null);
    const openButtonRef = useRef(null);
    const [screenSize, setScreenSize] = useState('desktop'); // 'mobile' | 'tablet' | 'desktop'

    useEffect(() => {
        setMounted(true);
        // Detect screen size
        const checkScreen = () => {
            const w = window.innerWidth;
            if (w <= 640) setScreenSize('mobile');
            else if (w <= 1024) setScreenSize('tablet');
            else setScreenSize('desktop');
        };
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    // Sidebar open state logic
    useEffect(() => {
        if (screenSize === 'desktop') {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    }, [screenSize]);

    // Focus trap logic
    useEffect(() => {
        if (!isSidebarOpen) return;
        const sidebar = sidebarRef.current;
        if (!sidebar) return;
        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ];
        const focusableEls = sidebar.querySelectorAll(focusableSelectors.join(','));
        const focusable = Array.from(focusableEls);
        if (focusable.length) focusable[0].focus();
        function handleKeyDown(e) {
            if (e.key === 'Tab') {
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
            if (e.key === "Escape") {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isSidebarOpen]);

    useEffect(() => {
        if (!isSidebarOpen && openButtonRef.current) {
            openButtonRef.current.focus();
        }
    }, [isSidebarOpen]);

    useEffect(() => {
        if (!isSidebarOpen) return;
        function handleClickOutside(e) {
            const sidebar = sidebarRef.current;
            if (!sidebar) return;
            if (!sidebar.contains(e.target)) {
                setIsSidebarOpen(false);
                if (e.target && typeof e.target.focus === "function" && e.target.tabIndex >= 0) {
                    setTimeout(() => e.target.focus(), 0);
                } else if (openButtonRef.current) {
                    setTimeout(() => openButtonRef.current.focus(), 0);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isSidebarOpen]);
    
    return (
        <>
            {/* Sidebar overlay for all devices */}
            {(isSidebarOpen || screenSize === 'desktop') && (
                <aside
                    ref={sidebarRef}
                    className="fixed top-0 left-0 h-full w-72 max-w-xs bg-black/80 backdrop-blur shadow-xl z-50 flex flex-col justify-between border-r border-blue-300 overflow-y-auto"
                    role="navigation"
                    aria-label="Sidebar Navigation"
                    tabIndex={-1}
                    style={
                        screenSize === 'mobile'
                            ? { width: '80vw', maxWidth: 260, right: 'auto' }
                            : { width: '16rem', maxWidth: '16rem' }
                    }
                >
                    <div>
                        {/* Close Button - only show on mobile/tablet (not desktop) */}
                        {(screenSize === 'mobile' || screenSize === 'tablet') && isSidebarOpen && (
                            <button
                                className="absolute top-4 right-4 text-white hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                                onClick={() => setIsSidebarOpen(false)}
                                aria-label="Close sidebar"
                                tabIndex={0}
                            >
                                <X size={28} />
                            </button>
                        )}
                        <br /><br />
                        <div
                            className="flex items-center justify-center h-24 text-3xl font-bold text-white tracking-wide hover:text-blue-700 transition-colors cursor-pointer"
                            onClick={() => { if (onNavigate) onNavigate('hero'); setIsSidebarOpen(false); }}
                            tabIndex={0}
                            aria-label="Go to Home"
                            role="button"
                            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { if (onNavigate) onNavigate('hero'); setIsSidebarOpen(false); } }}
                        >
                            Portfolio
                        </div>
                        {/* Navigation */}
                        <nav className="flex flex-col gap-2 mt-10 px-6" aria-label="Main navigation">
                            {navLinks.map((link) => (
                                <button
                                    key={link.section}
                                    onClick={() => { if (onNavigate) onNavigate(link.section); setIsSidebarOpen(false); }}
                                    className="text-lg text-white hover:text-blue-700 py-3 px-4 rounded-lg transition-colors text-left font-medium hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    aria-label={`Go to ${link.label}`}
                                    tabIndex={0}
                                >
                                    {link.label}
                                </button>
                            ))}
                        </nav>
                        <div className="flex justify-center my-4">
                            <a
                                href="https://drive.google.com/uc?export=download&id=1S0nqdpUimw_mBBQNxVdTZzinGrdFv7Xg"
                                className="flex items-center gap-2 px-4 py-2 w-44 justify-center rounded-lg bg-gray-900 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                                aria-label="Download Resume"
                                target="_blank"
                                rel="noopener noreferrer"
                                tabIndex={0}
                            >
                                Download Resume
                            </a>
                        </div>
                        <div className="flex justify-center my-4">
                            {mounted && (
                                <button
                                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                                    className="flex items-center gap-2 px-4 py-2 w-44 justify-center rounded-lg bg-gray-900 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    aria-label="Toggle theme"
                                    tabIndex={0}
                                >
                                    {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                                    <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Social Links */}
                    <div className="flex flex-row items-center gap-4 mb-8 px-16">
                        {socialLinks.map(({ href, icon: Icon, label }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                                aria-label={label}
                                tabIndex={0}
                            >
                                <Icon size={24} />
                            </a>
                        ))}
                    </div>
                </aside>
            )}

            {/* Mobile/iPad/tablet sticky footer nav */}
            {screenSize === 'mobile' && !isSidebarOpen && (
                <nav
                    className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur flex justify-around items-center h-16 border-t border-blue-300"
                    aria-label="Footer Navigation"
                >
                    <button
                        onClick={() => { if (onNavigate) onNavigate('hero'); }}
                        className="flex flex-col items-center text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 px-2"
                        aria-label="Home"
                        tabIndex={0}
                    >
                        <Home size={24} />
                        <span className="text-xs">Home</span>
                    </button>
                    <button
                        onClick={() => { if (onNavigate) onNavigate('projects'); }}
                        className="flex flex-col items-center text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 px-2"
                        aria-label="Projects"
                        tabIndex={0}
                    >
                        <Folder size={24} />
                        <span className="text-xs">Projects</span>
                    </button>
                    <button
                        onClick={() => { if (onNavigate) onNavigate('contact'); }}
                        className="flex flex-col items-center text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 px-2"
                        aria-label="Contact"
                        tabIndex={0}
                    >
                        <MailIcon size={24} />
                        <span className="text-xs">Contact</span>
                    </button>
                    {/* Theme toggle button */}
                    <button
                        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                        className="flex flex-col items-center text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 px-2"
                        aria-label="Toggle theme"
                        tabIndex={0}
                    >
                        {resolvedTheme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
                        <span className="text-xs">{resolvedTheme === "dark" ? "Light" : "Dark"}</span>
                    </button>
                    {/* Sidebar open button in footer */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        ref={openButtonRef}
                        className="flex flex-col items-center text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 px-2"
                        aria-label="Open sidebar"
                        tabIndex={0}
                    >
                        <Menu size={24} />
                        <span className="text-xs">Menu</span>
                    </button>
                </nav>
            )}

            {/* Tablet sidebar open button (not on mobile or desktop) */}
            {screenSize === 'tablet' && !isSidebarOpen && (
                <SidebarOpenButton
                    className=""
                    onClick={() => setIsSidebarOpen(true)}
                    ref={openButtonRef}
                />
            )}
        </>
    );
};

export default Sidebar;