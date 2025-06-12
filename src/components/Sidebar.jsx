import React, { useState, useRef, useEffect } from 'react';
import { Github, Linkedin, Mail, Sun, Moon, Home, User, FolderKanban, Mail as MailIcon, Briefcase, ArrowLeftRight, Award, Layers, Smartphone, FileText, LogIn, LogOut } from 'lucide-react';
import { useTheme } from "next-themes";

const navLinks = [
	{ label: 'Home', section: 'hero', icon: Home },
	{ label: 'About', section: 'about', icon: User },
	{ label: 'Experience', section: 'experience', icon: Briefcase },
	{ label: 'Skills', section: 'skills', icon: Layers },
	{ label: 'Projects', section: 'projects', icon: FolderKanban },
	{ label: 'Certificates', section: 'certs', icon: Award },
	{ label: 'Contact', section: 'contact', icon: MailIcon }
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

// Sidebar nav button component
const SidebarNavButton = ({ label, icon: Icon, onClick, active }) => (
	<button
		onClick={onClick}
		className={`flex items-center gap-3 text-lg py-3 px-4 rounded-lg transition-colors text-left font-medium focus:outline-none focus:ring-2 focus:ring-blue-400
			${active ? "bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200" : "text-white hover:text-blue-700 hover:bg-blue-100"}
		`}
		aria-label={`Go to ${label}`}
		tabIndex={0}
	>
		{Icon && <Icon size={22} />}
		<span>{label}</span>
	</button>
);

const Sidebar = ({ 
  onNavigate, 
  activeSection, 
  setShowLogin, 
  isAdmin, 
  signOut, 
  auth,
  // Admin panel props - updated to match AdminPanel
  content,
  loadLocalContent,
  loadContentFromDrive,
  saveContentToDrive,
  driveSaving,
  loading
}) => {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const sidebarRef = useRef(null);
	const openButtonRef = useRef(null);	const [screenSize, setScreenSize] = useState('desktop');	const [showMoreMenu, setShowMoreMenu] = useState(false);
	const [showAlternateButtons, setShowAlternateButtons] = useState(false);
	const [userToggledNavigation, setUserToggledNavigation] = useState(false);
	const moreButtonRef = useRef(null);
	const moreMenuRef = useRef(null);
		// Triple click detection state
	const [clickCount, setClickCount] = useState(0);
	const clickTimeoutRef = useRef(null);
		// Portfolio triple click detection state
	const [portfolioClickCount, setPortfolioClickCount] = useState(0);
	const portfolioClickTimeoutRef = useRef(null);	const [showAdminLogin, setShowAdminLogin] = useState(false);
	const [adminLoginClicked, setAdminLoginClicked] = useState(false);
	const adminLoginRef = useRef(null);
	
	// Admin panel state matching AdminPanel.jsx
	const [switchingContent, setSwitchingContent] = useState(false);
		// Determine current content source
	const isUsingLocalContent = content?.fallbackUsed || false;
	const isUsingDriveContent = content?.driveAttempted && !content?.fallbackUsed;

	// Admin functions matching AdminPanel.jsx
	const handleToggleContentSource = async () => {
		setSwitchingContent(true);
		
		try {
			if (isUsingLocalContent) {
				// Currently using local, switch to Drive
				console.log('Switching from local to Drive content...');
				// Force fresh load from Drive by clearing all caches first
				try {
					const { clearContentCache } = await import('../utils/contentLoader');
					clearContentCache(); // Clear module cache
					
					// Use simple public fetch method
					await loadContentFromDrive(false);
					
					console.log('Successfully loaded fresh Drive content for admin');
				} catch (importError) {
					if (process.env.NODE_ENV === 'development') {
						console.log('🔄 Using fallback method in development mode');
					} else {
						console.warn('Could not import load functions, using standard method');
					}
					await loadContentFromDrive(false);
				}
			} else {
				// Currently using Drive, switch to Local
				console.log('Switching from Drive to local content...');
				await loadLocalContent(false); // Pass false to prevent loading screen
			}
		} catch (error) {
			console.error('Error switching content source:', error);
			alert('Failed to switch content source: ' + error.message);
		} finally {
			setSwitchingContent(false);
		}
	};

	const handleRefreshContent = async () => {
		console.log('Sidebar: Refreshing current content source');
		setSwitchingContent(true);
		
		try {
			if (isUsingLocalContent) {
				await loadLocalContent(false); // Pass false to prevent loading screen
			} else {
				// Force fresh load from Drive by clearing caches first
				try {
					const { clearContentCache } = await import('../utils/contentLoader');
					clearContentCache(); // Clear module cache
					await loadContentFromDrive(false); // Pass false to prevent loading screen
				} catch (importError) {
					console.warn('Could not import fresh load functions, using standard method');
					await loadContentFromDrive(false);
				}
			}
			console.log('Successfully refreshed content');
		} catch (error) {
			console.error('Error refreshing content:', error);
			alert('Failed to refresh content: ' + error.message);
		} finally {
			setSwitchingContent(false);
		}
	};useEffect(() => {
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
		return () => {
			window.removeEventListener('resize', checkScreen);
		};
	}, []);	// Sync navigation mode with active section when screen size changes or active section changes
	useEffect(() => {
		// Only apply this logic for mobile/tablet screens
		if (screenSize === 'desktop') return;
		
		// Don't auto-sync if user has manually toggled navigation
		if (userToggledNavigation) return;

		// Define which sections belong to alternate buttons
		const alternateSections = ['projects', 'certs', 'contact'];
		const shouldShowAlternate = alternateSections.includes(activeSection);
		
		// Update navigation mode if it doesn't match the current active section
		setShowAlternateButtons(shouldShowAlternate);
	}, [activeSection, screenSize, userToggledNavigation]);

	// Reset user toggle flag only when screen size changes to desktop (to enable auto-sync when returning to mobile)
	useEffect(() => {
		if (screenSize === 'desktop') {
			setUserToggledNavigation(false);
		}
	}, [screenSize]);
	// Hide More menu when clicking outside
	useEffect(() => {
		if (!showMoreMenu) return;
		function handleClickOutside(e) {
			if (
				moreMenuRef.current &&
				!moreMenuRef.current.contains(e.target) &&
				moreButtonRef.current &&
				!moreButtonRef.current.contains(e.target)
			) {
				setShowMoreMenu(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showMoreMenu]);

	// Handle Portfolio triple click detection
	const handlePortfolioClick = () => {
		setPortfolioClickCount(prev => prev + 1);
		
		// Clear existing timeout
		if (portfolioClickTimeoutRef.current) {
			clearTimeout(portfolioClickTimeoutRef.current);
		}
		
		// Set a new timeout to reset click count after 500ms
		portfolioClickTimeoutRef.current = setTimeout(() => {
			const currentCount = portfolioClickCount + 1; // +1 because state update is async
			
			if (currentCount === 3) {
				// Triple click - show admin login button
				setShowAdminLogin(true);
			}
			
			setPortfolioClickCount(0);
		}, 300); // 300ms window for detecting multiple clicks
	};

	// Handle triple click detection
	const handleToggleClick = () => {
		setClickCount(prev => prev + 1);
		
		// Clear existing timeout
		if (clickTimeoutRef.current) {
			clearTimeout(clickTimeoutRef.current);
		}
		
		// Set a new timeout to reset click count after 500ms
		clickTimeoutRef.current = setTimeout(() => {
			const currentCount = clickCount + 1; // +1 because state update is async
			
			if (currentCount === 3) {
				// Triple click - open menu popup
				setShowMoreMenu(true);
			} else {
				// Single or double click - toggle navigation buttons
				setShowAlternateButtons(prev => !prev);
				// Mark that user has manually toggled navigation
				setUserToggledNavigation(true);
			}
			
			setClickCount(0);
		}, 300); // 300ms window for detecting multiple clicks
	};	// Hide admin login button when user exits admin mode
	useEffect(() => {
		if (!isAdmin) {
			setShowAdminLogin(false);
			setAdminLoginClicked(false);
		}
	}, [isAdmin]);

	// Hide admin login button when clicking outside of it (only if not clicked yet)
	useEffect(() => {
		if (!showAdminLogin || adminLoginClicked) return;
		
		function handleClickOutside(e) {
			if (
				adminLoginRef.current &&
				!adminLoginRef.current.contains(e.target)
			) {
				setShowAdminLogin(false);
			}
		}
		
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showAdminLogin, adminLoginClicked]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (clickTimeoutRef.current) {
				clearTimeout(clickTimeoutRef.current);
			}
			if (portfolioClickTimeoutRef.current) {
				clearTimeout(portfolioClickTimeoutRef.current);
			}
		};
	}, []);

	return (
		<>
			{/* Sidebar only for desktop */}
			{screenSize === 'desktop' && (
				<aside
					ref={sidebarRef}
					className="fixed top-0 left-0 h-full w-72 max-w-xs bg-black/80 backdrop-blur shadow-xl z-50 flex flex-col justify-between border-r border-blue-300 overflow-y-auto"
					role="navigation"
					aria-label="Sidebar Navigation"
					tabIndex={-1}
					style={{ width: '16rem', maxWidth: '16rem' }}
				>
					<div>
						<br /><br />						<div
							className="flex items-center justify-center h-24 text-3xl font-bold text-white tracking-wide hover:text-blue-700 transition-colors cursor-pointer"
							onClick={handlePortfolioClick}
							tabIndex={0}
							aria-label="Portfolio - Triple click for admin access"
							role="button"
						>
							Portfolio
						</div>
						{/* Navigation */}
						<nav className="flex flex-col gap-2 mt-10 px-6" aria-label="Main navigation">
							{navLinks.map((link) => (
								<SidebarNavButton
									key={link.section}
									label={link.label}
									icon={link.icon}
									onClick={() => {
										if (onNavigate) onNavigate(link.section);
									}}
									active={activeSection === link.section}
								/>
							))}
						</nav>						{/* Admin Login/Exit Admin button (desktop) */}
						{showAdminLogin && (
							<div className="flex justify-center my-4" ref={adminLoginRef}>
								{!isAdmin ? (
									<button
										onClick={() => {
											setShowLogin(true);
											setAdminLoginClicked(true);
										}}
										className="flex items-center gap-2 px-4 py-2 w-44 justify-center rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
										aria-label="Admin Login"
										tabIndex={0}
									>
										<LogIn size={20} />
										<span>Admin Login</span>
									</button>
								) : (
									<button
										onClick={() => signOut(auth)}
										className="flex items-center gap-2 px-4 py-2 w-44 justify-center rounded-lg bg-red-700 text-white hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
										aria-label="Exit Admin"
										tabIndex={0}
									>
										<LogOut size={20} />
										<span>Exit Admin</span>
									</button>
								)}
							</div>
						)}
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
			)}			{/* Mobile/tablet sticky footer nav */}
			{(screenSize === 'mobile' || screenSize === 'tablet') && (
				<nav
					className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur flex items-center h-16 border-t border-blue-300"
					aria-label="Footer Navigation"
				>					<button
						onClick={() => { 
							if (showAlternateButtons) {
								if (onNavigate) onNavigate('projects');
							} else {
								if (onNavigate) onNavigate('hero');
							}
							// Reset user toggle flag when user explicitly navigates
							setUserToggledNavigation(false);
						}}
						className={`flex flex-col items-center justify-center flex-1 h-full focus:outline-none focus:ring-2 focus:ring-blue-400
							${(showAlternateButtons ? activeSection === 'projects' : activeSection === 'hero')
								? 'text-blue-400'
								: 'text-white hover:text-blue-400'}
						`}
						aria-label={showAlternateButtons ? "Projects" : "Home"}
						tabIndex={0}
					>						{showAlternateButtons ? <FolderKanban size={24} /> : <Home size={24} />}
						<span className="text-xs mt-1 text-center leading-tight">{showAlternateButtons ? "Projects" : "Home"}</span>
					</button>					<button
						onClick={() => { 
							if (showAlternateButtons) {
								if (onNavigate) onNavigate('certs');
							} else {
								if (onNavigate) onNavigate('about');
							}
							// Reset user toggle flag when user explicitly navigates
							setUserToggledNavigation(false);
						}}
						className={`flex flex-col items-center justify-center flex-1 h-full focus:outline-none focus:ring-2 focus:ring-blue-400
							${(showAlternateButtons ? activeSection === 'certs' : activeSection === 'about')
								? 'text-blue-400'
								: 'text-white hover:text-blue-400'}
						`}
						aria-label={showAlternateButtons ? "Certificates" : "About"}
						tabIndex={0}
					>						{showAlternateButtons ? <Award size={24} /> : <User size={24} />}
						<span className="text-xs mt-1 text-center leading-tight">{showAlternateButtons ? "Certs" : "About"}</span>
					</button>					{/* More button and its popup */}
					<div className="relative flex flex-col items-center justify-center flex-1 h-full">						<button
							ref={moreButtonRef}
							onClick={handleToggleClick}
							className={`flex flex-col items-center justify-center w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-400
								${showMoreMenu
									? 'text-blue-400'
									: 'text-white hover:text-blue-400'}
							`}
							aria-label="Toggle navigation options and settings menu. Triple click to open menu."
							tabIndex={0}
						><ArrowLeftRight size={24} />
							<span className="text-xs mt-1 text-center leading-tight">Toggle</span>
						</button>
						{showMoreMenu && (							<div
								ref={moreMenuRef}
								className="absolute bottom-14 flex flex-col items-center gap-2 z-50 bg-gray-900 rounded-xl shadow-lg px-2 py-3"
							>								<div className="flex flex-col gap-4 py-1 px-2">
									{/* Admin panel buttons - only show if admin */}
									{isAdmin && (
										<>
											{/* Refresh Content */}
											<button
												onClick={() => {
													handleRefreshContent();
													setShowMoreMenu(false);
												}}
												disabled={switchingContent || loading}
												className={`flex flex-col items-center focus:outline-none focus:ring-2 ${
													switchingContent || loading
														? 'text-gray-500 cursor-not-allowed focus:ring-gray-400'
														: 'text-white hover:text-blue-400 focus:ring-blue-400'
												}`}
												aria-label="Refresh Content"
												tabIndex={0}
											>
												<FileText size={20} />
												<span className="text-xs mt-1">{switchingContent ? 'Refreshing...' : 'Refresh Content'}</span>
											</button>
											
											{/* Save to Drive */}
											<button
												onClick={() => {
													if (!driveSaving && !loading) {
														saveContentToDrive();
													}
													setShowMoreMenu(false);
												}}
												disabled={driveSaving || loading}
												className={`flex flex-col items-center focus:outline-none focus:ring-2 ${
													driveSaving || loading
														? 'text-gray-500 cursor-not-allowed focus:ring-gray-400'
														: 'text-white hover:text-purple-400 focus:ring-purple-400'
												}`}
												aria-label="Save to Drive"
												tabIndex={0}
											>
												<FileText size={20} />
												<span className="text-xs mt-1">{driveSaving ? 'Saving...' : 'Save to Drive'}</span>
											</button>
											
											{/* Load from Local Files */}
											<button
												onClick={() => {
													handleToggleContentSource();
													setShowMoreMenu(false);
												}}
												disabled={switchingContent || loading}
												className={`flex flex-col items-center focus:outline-none focus:ring-2 ${
													switchingContent || loading
														? 'text-gray-500 cursor-not-allowed focus:ring-gray-400'
														: isUsingLocalContent 
															? 'text-white hover:text-green-400 focus:ring-green-400'
															: 'text-white hover:text-orange-400 focus:ring-orange-400'
												}`}
												aria-label={isUsingLocalContent ? 'Load from Google Drive' : 'Load from Local Files'}
												tabIndex={0}
											>
												<FileText size={20} />
												<span className="text-xs mt-1">
													{switchingContent 
														? 'Switching...' 
														: isUsingLocalContent 
															? 'Load from Drive' 
															: 'Load from Local'
													}
												</span>
											</button>
										</>
									)}
									
									{/* Admin Login/Exit Admin button (mobile/tablet) - moved below Load from Drive */}
									{!isAdmin ? (
										<button
											onClick={() => {
												setShowLogin(true);
												setShowMoreMenu(false);
											}}
											className="flex flex-col items-center text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
											aria-label="Admin Login"
											tabIndex={0}
										>
											<LogIn size={20} />
											<span className="text-xs mt-1">Admin Login</span>
										</button>
									) : (										<button
											onClick={() => {
												signOut(auth);
												setShowMoreMenu(false);
											}}
											className="flex flex-col items-center text-white hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400"
											aria-label="Exit Admin"
											tabIndex={0}
										>
											<LogOut size={20} />
											<span className="text-xs mt-1">Exit Admin</span>
										</button>
									)}
								</div>
							</div>
						)}
					</div>					<button
						onClick={() => { 
							if (showAlternateButtons) {
								if (onNavigate) onNavigate('contact');
							} else {
								if (onNavigate) onNavigate('experience');
							}
							// Reset user toggle flag when user explicitly navigates
							setUserToggledNavigation(false);
						}}
						className={`flex flex-col items-center justify-center flex-1 h-full focus:outline-none focus:ring-2 focus:ring-blue-400
							${(showAlternateButtons ? activeSection === 'contact' : activeSection === 'experience')
								? 'text-blue-400'
								: 'text-white hover:text-blue-400'}
						`}
						aria-label={showAlternateButtons ? "Contact" : "Experience"}
						tabIndex={0}
					>						{showAlternateButtons ? <MailIcon size={24} /> : <Briefcase size={24} />}
						<span className="text-xs mt-1 text-center leading-tight">{showAlternateButtons ? "Contact" : "Experience"}</span>
					</button>					<button
						onClick={() => { 
							if (showAlternateButtons) {
								setTheme(resolvedTheme === "dark" ? "light" : "dark");
							} else {
								if (onNavigate) onNavigate('skills');
								// Reset user toggle flag when user explicitly navigates
								setUserToggledNavigation(false);
							}
						}}
						className={`flex flex-col items-center justify-center flex-1 h-full focus:outline-none focus:ring-2 focus:ring-blue-400
							${(!showAlternateButtons && activeSection === 'skills')
								? 'text-blue-400'
								: 'text-white hover:text-blue-400'}
						`}
						aria-label={showAlternateButtons ? "Toggle Theme" : "Skills"}
						tabIndex={0}
					>						{showAlternateButtons ? (resolvedTheme === "dark" ? <Sun size={24} /> : <Moon size={24} />) : <Layers size={24} />}
						<span className="text-xs mt-1 text-center leading-tight">{showAlternateButtons ? "Theme" : "Skills"}</span>
					</button>
				</nav>
			)}
		</>
	);
};

export default Sidebar;