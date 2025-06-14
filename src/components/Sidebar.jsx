import { useState, useRef, useEffect } from 'react';
import { Github, Linkedin, Mail, Sun, Moon, Home, User, FolderKanban, Mail as MailIcon, Briefcase, ArrowLeftRight, Award, Layers, Smartphone, FileText, LogIn, LogOut, Monitor, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Sidebar nav button component with responsive sizing
const SidebarNavButton = ({ label, icon: Icon, onClick, active, windowWidth, isCollapsed }) => {
	const isSmall = windowWidth < 768;
	const isMedium = windowWidth >= 768 && windowWidth < 1024;
	const iconSize = isSmall ? 20 : isMedium ? 22 : 24;
	const fontSize = isSmall ? 'text-base' : isMedium ? 'text-lg' : 'text-lg';
	
	return (
		<button
			onClick={onClick}
			className={`flex flex-row items-center ${isCollapsed ? 'justify-center px-2 py-2' : 'justify-start px-4 py-3'} gap-4 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 w-full
				${active ? "bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200" : "text-white hover:text-blue-700 hover:bg-blue-100"}
			`}
			aria-label={`Go to ${label}`}
			tabIndex={0}
		>
			{Icon && <Icon size={iconSize} />}
			{!isCollapsed && <span className={`${fontSize} leading-tight`}>{label}</span>}
		</button>
	);
};

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
  loading,
  // View toggle callback
  onViewModeChange,
  // Current view mode from parent
  viewMode,
  // Sidebar collapse callback
  onSidebarCollapseChange
}) => {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const sidebarRef = useRef(null);
	const openButtonRef = useRef(null);
		// Responsive sizing based on window width
	const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
	const isSmallDesktop = windowWidth < 768;
	const isMediumDesktop = windowWidth >= 768 && windowWidth < 1024;
	const isLargeDesktop = windowWidth >= 1024;
		// Helper functions for responsive sizing
	const getIconSize = (baseSize = 'medium') => {
		const sizes = {
			small: isSmallDesktop ? 14 : isMediumDesktop ? 16 : 18,
			medium: isSmallDesktop ? 16 : isMediumDesktop ? 18 : 20,
			large: isSmallDesktop ? 18 : isMediumDesktop ? 20 : 22,
			xlarge: isSmallDesktop ? 22 : isMediumDesktop ? 24 : 28,
			xxlarge: isSmallDesktop ? 26 : isMediumDesktop ? 28 : 32
		};
		return sizes[baseSize] || sizes.medium;
	};
	const getTextSize = (baseSize = 'base') => {
		const sizes = {
			xs: isSmallDesktop ? 'text-xs' : 'text-xs',
			sm: isSmallDesktop ? 'text-xs' : isMediumDesktop ? 'text-sm' : 'text-sm',
			base: isSmallDesktop ? 'text-sm' : isMediumDesktop ? 'text-base' : 'text-base',
			lg: isSmallDesktop ? 'text-base' : isMediumDesktop ? 'text-lg' : 'text-xl',
			xl: isSmallDesktop ? 'text-lg' : isMediumDesktop ? 'text-xl' : 'text-2xl',
			xxl: isSmallDesktop ? 'text-xl' : isMediumDesktop ? 'text-2xl' : 'text-3xl'
		};
		return sizes[baseSize] || sizes.base;
	};	// Use view mode from parent (single source of truth)
	const currentViewMode = viewMode || 'desktop';
	const isCurrentlyDesktop = currentViewMode === 'desktop';
	
	// Sidebar collapse state (desktop only)
	const [isCollapsed, setIsCollapsed] = useState(false);
	
	// Admin access states
	const [showAdminToggle, setShowAdminToggle] = useState(false);
	// Mobile/tablet navigation states
	const [showMoreMenu, setShowMoreMenu] = useState(false);
	const [showAlternateButtons, setShowAlternateButtons] = useState(false);
	const [userToggledNavigation, setUserToggledNavigation] = useState(false);
	const moreButtonRef = useRef(null);
	const moreMenuRef = useRef(null);
		
	// Mobile toggle button triple click detection state (for admin access)
	const [mobileToggleClickCount, setMobileToggleClickCount] = useState(0);
	const [showMobileAdminAccess, setShowMobileAdminAccess] = useState(false);
	const mobileToggleClickTimeoutRef = useRef(null);		// Portfolio triple click detection state
	const [portfolioClickCount, setPortfolioClickCount] = useState(0);
	const portfolioClickTimeoutRef = useRef(null);
	
	// Admin toggle auto-hide timer
	const adminToggleTimeoutRef = useRef(null);
	
	// Admin login state
	const [showAdminLogin, setShowAdminLogin] = useState(false);
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
	};	useEffect(() => {
		setMounted(true);
	}, []);

	// Sync navigation mode with active section when in mobile/tablet view
	useEffect(() => {
		// Only apply this logic for mobile/tablet view
		if (isCurrentlyDesktop) return;
		
		// Don't auto-sync if user has manually toggled navigation
		if (userToggledNavigation) return;

		// Define which sections belong to alternate buttons
		const alternateSections = ['projects', 'certs', 'contact'];
		const shouldShowAlternate = alternateSections.includes(activeSection);
		
		// Update navigation mode if it doesn't match the current active section
		setShowAlternateButtons(shouldShowAlternate);
	}, [activeSection, isCurrentlyDesktop, userToggledNavigation]);

	// Reset user toggle flag when switching to desktop view
	useEffect(() => {
		if (isCurrentlyDesktop) {
			setUserToggledNavigation(false);
		}
	}, [isCurrentlyDesktop]);
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
		return () => document.removeEventListener("mousedown", handleClickOutside);	}, [showMoreMenu]);

	// Handle view mode changes and notify parent
	const handleViewModeChange = (newViewMode) => {
		if (onViewModeChange) {
			onViewModeChange(newViewMode);
		}
	};	// Handle mobile toggle button click detection (navigation toggle + admin access)
	const handleMobileToggleClick = () => {
		setMobileToggleClickCount(prev => {
			const newCount = prev + 1;
			
			// Clear existing timeout
			if (mobileToggleClickTimeoutRef.current) {
				clearTimeout(mobileToggleClickTimeoutRef.current);
			}
			
			// Set a new timeout to reset click count after 300ms
			mobileToggleClickTimeoutRef.current = setTimeout(() => {				if (newCount === 3) {
					// Triple click - show admin access in mobile menu
					console.log('Mobile triple-click detected - showing admin button and starting 10s timer');
					setShowMobileAdminAccess(true);
					setShowMoreMenu(true); // Ensure menu is open to see admin option
					
					// Start auto-hide timer (hide after 10 seconds if not clicked)
					if (adminToggleTimeoutRef.current) {
						clearTimeout(adminToggleTimeoutRef.current);
					}					adminToggleTimeoutRef.current = setTimeout(() => {
						console.log('Mobile admin access auto-hide timer triggered - hiding mobile admin button');
						setShowMobileAdminAccess(false);
					}, 3000); // Hide after 10 seconds
				}else if (newCount === 1) {
					// Single click - toggle navigation buttons AND show menu
					setShowAlternateButtons(prev => !prev);
					setUserToggledNavigation(true);
					setShowMoreMenu(true);
				} else if (newCount === 2) {
					// Double click - just toggle menu without changing navigation
					setShowMoreMenu(prev => !prev);
				}
				
				setMobileToggleClickCount(0);
			}, 300); // 300ms window for detecting multiple clicks
			
			return newCount;
		});
	};	// Handle Portfolio triple click detection (desktop only - for admin access)
	const handlePortfolioClick = () => {
		// Only handle triple clicks on desktop
		if (!isCurrentlyDesktop) return;
		
		setPortfolioClickCount(prev => {
			const newCount = prev + 1;
			
			// Clear existing timeout
			if (portfolioClickTimeoutRef.current) {
				clearTimeout(portfolioClickTimeoutRef.current);
			}
			
			// Set a new timeout to reset click count after 300ms
			portfolioClickTimeoutRef.current = setTimeout(() => {				if (newCount === 3) {
					// Triple click - show admin toggle button
					console.log('Desktop triple-click detected - showing admin button and starting 10s timer');
					setShowAdminToggle(true);
					
					// Start auto-hide timer (hide after 10 seconds if not clicked)
					if (adminToggleTimeoutRef.current) {
						clearTimeout(adminToggleTimeoutRef.current);
					}					adminToggleTimeoutRef.current = setTimeout(() => {
						console.log('Admin toggle auto-hide timer triggered - hiding desktop admin button');
						setShowAdminToggle(false);
					}, 3000); // Hide after 10 seconds
				}
				
				setPortfolioClickCount(0);
			}, 300); // 300ms window for detecting multiple clicks
			
			return newCount;
		});
	};// Hide admin UI when user exits admin mode
	useEffect(() => {
		if (!isAdmin) {
			setShowAdminToggle(false);
			setShowMobileAdminAccess(false);
			// Clear admin toggle timeout when hiding admin UI
			if (adminToggleTimeoutRef.current) {
				clearTimeout(adminToggleTimeoutRef.current);
				adminToggleTimeoutRef.current = null;
			}
		}
	}, [isAdmin]);
	// Window resize listener for responsive sidebar
	useEffect(() => {
		const handleResize = () => {
			setWindowWidth(window.innerWidth);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (portfolioClickTimeoutRef.current) {
				clearTimeout(portfolioClickTimeoutRef.current);
			}
			if (mobileToggleClickTimeoutRef.current) {
				clearTimeout(mobileToggleClickTimeoutRef.current);
			}
			if (adminToggleTimeoutRef.current) {
				clearTimeout(adminToggleTimeoutRef.current);
			}
		};
	}, []);
	return (
		<>
			{/* Sidebar only for desktop view */}
			{isCurrentlyDesktop && (
				<div className="relative">
					<aside
						ref={sidebarRef}
						className={`fixed top-0 left-0 h-full bg-black/80 backdrop-blur shadow-xl z-50 flex flex-col border-r border-blue-300 overflow-y-auto transition-all duration-300
    					${isCollapsed ? 'w-20' : 'w-52'}`}
						role="navigation"
						aria-label="Sidebar Navigation"
						tabIndex={-1}
					>
						{/* Portfolio Header */}
						<div className="flex flex-col items-center py-4">
							{!isCollapsed && (
								<div
									className={`flex items-center justify-center text-center font-bold text-white tracking-wide hover:text-blue-700 transition-colors cursor-pointer px-2 ${
										isSmallDesktop ? 'h-14' : isMediumDesktop ? 'h-16' : 'h-20'
									} ${getTextSize('xl')}`}
									onClick={handlePortfolioClick}
									tabIndex={0}
									aria-label="Portfolio - Triple click for admin access"
									role="button"
								>
									Portfolio
								</div>
							)}
							
							{/* Admin Toggle Button (appears after 3 clicks on Portfolio) */}
							{!isCollapsed && showAdminToggle && (
							<div className="flex justify-center">
								{!isAdmin ? (
									<button
										onClick={() => {
											console.log('Desktop admin login button clicked - clearing timer');
											setShowLogin(true);
											// Clear auto-hide timer since user clicked the admin button
											if (adminToggleTimeoutRef.current) {
												clearTimeout(adminToggleTimeoutRef.current);
												adminToggleTimeoutRef.current = null;
											}
										}}
										className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${getTextSize('sm')}`}
										aria-label="Admin Login"
										tabIndex={0}
									>
										<LogIn size={getIconSize('medium')} />
										<span>Admin</span>
									</button>
								) : (
									<button
										onClick={() => signOut(auth)}
										className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 ${getTextSize('sm')}`}
										aria-label="Exit Admin"
										tabIndex={0}
									>
										<LogOut size={getIconSize('medium')} />
										<span>Exit</span>
									</button>
								)}
							</div>
						)}
					</div>					{/* Centered Navigation */}
					<div className="flex-1 flex flex-col justify-center">
						<nav className={`flex flex-col ${isCollapsed ? 'gap-2 px-0.5' : 'gap-1 px-4'} w-full`} aria-label="Main navigation">
							{navLinks.map((link) => (
								<SidebarNavButton
									key={link.section}
									label={link.label}
									icon={link.icon}
									onClick={() => {
										if (onNavigate) onNavigate(link.section);
									}}
									active={activeSection === link.section}
									windowWidth={windowWidth}
									isCollapsed={isCollapsed}
								/>
							))}
						</nav>
					</div>{/* Footer section */}
					<div className="flex flex-col items-center pb-4">
						{/* Social Links - hide when collapsed */}
						{!isCollapsed && (
							<div className={`flex flex-row items-center justify-center gap-3 mb-4 ${isSmallDesktop ? 'px-2' : 'px-4'}`}>
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
										<Icon size={getIconSize('large')} />
									</a>
								))}
							</div>
						)}
						
						{/* Theme Toggle and View Toggle buttons side by side - hide when collapsed */}
						{!isCollapsed && (
							<div className="flex flex-row items-center justify-center gap-3 mb-4">
								{/* Theme Toggle Button */}
								<button
									onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
									className={`flex flex-row items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 w-24 h-12 ${getTextSize('sm')}`}
									aria-label="Toggle Theme"
									tabIndex={0}
								>
									{resolvedTheme === "dark" ? <Sun size={getIconSize('xxlarge')} /> : <Moon size={getIconSize('xxlarge')} />}
									<span className="text-center leading-tight">Theme</span>
								</button>

								{/* View Toggle Button */}
								<button
									onClick={() => {
										// Direct toggle between desktop and mobile
										const newViewMode = isCurrentlyDesktop ? 'mobile' : 'desktop';
										if (onViewModeChange) onViewModeChange(newViewMode);
									}}
									className={`flex flex-row items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 w-24 h-12 ${getTextSize('sm')}`}
									aria-label={`${isCurrentlyDesktop ? 'Mobile' : 'Desktop'} View`}
									tabIndex={0}
								>
									<Smartphone size={getIconSize('xxlarge')} />
									<span className="text-center leading-tight text-xs">Mobile</span>
								</button>
							</div>
						)}
					</div>
				</aside>				{/* Sidebar Collapse/Expand Button */}				<button
					onClick={() => {
						const newCollapsedState = !isCollapsed;
						setIsCollapsed(newCollapsedState);
						if (onSidebarCollapseChange) {
							onSidebarCollapseChange(newCollapsedState);
						}
					}}
					className = {
						`fixed top-1/2 transform -translate-y-1/2 
						bg-black/90 hover:bg-black text-white rounded-full border border-blue-300
						p-2 transition-all duration-300 focus:outline-none
						focus:ring-2 focus:ring-blue-400 z-[60] shadow-lg
						${isCollapsed ? 'left-16' : 'left-48'}
					`}
					aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
				>					{isCollapsed ? (
						<ChevronRight size={20} />
					) : (
						<ChevronLeft size={20} />
					)}
				</button>
				</div>
			)}{/* Mobile sticky footer nav */}
			{!isCurrentlyDesktop && (
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
					<div className="relative flex flex-col items-center justify-center flex-1 h-full">
						<button
							ref={moreButtonRef}
							onClick={(e) => {
								e.preventDefault();
								handleMobileToggleClick();
							}}
							onTouchStart={(e) => {
								e.preventDefault();
							}}
							style={{ 
								touchAction: 'manipulation',
								userSelect: 'none',
								WebkitUserSelect: 'none',
								WebkitTouchCallout: 'none'
							}}
							className={`flex flex-col items-center justify-center w-full h-full focus:outline-none focus:ring-2 focus:ring-blue-400
								${showMoreMenu
									? 'text-blue-400'
									: 'text-white hover:text-blue-400'}
							`}
							aria-label="Toggle navigation options and settings menu. Triple click for admin access."
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
										</>									)}									{/* View Toggle button (mobile/tablet) - always show */}
									<button
										onClick={() => {
											// Toggle between desktop and mobile view
											const newViewMode = isCurrentlyDesktop ? 'mobile' : 'desktop';
											if (onViewModeChange) onViewModeChange(newViewMode);
											setShowMoreMenu(false);
										}}
										className="flex flex-col items-center text-white hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400"
										aria-label={isCurrentlyDesktop ? "Switch to Mobile View" : "Switch to Desktop View"}
										tabIndex={0}
									>
										<Monitor size={20} />
										<span className="text-xs mt-1">Desktop View</span>
									</button>

									{/* Admin Login/Exit Admin button (mobile/tablet) - show only after triple click or if already admin */}
									{(showMobileAdminAccess || isAdmin) && (										!isAdmin ? (											<button
												onClick={() => {
													console.log('Mobile admin login button clicked - clearing timer');
													setShowLogin(true);
													setShowMoreMenu(false);
													// Clear auto-hide timer since user clicked the admin button
													if (adminToggleTimeoutRef.current) {
														clearTimeout(adminToggleTimeoutRef.current);
														adminToggleTimeoutRef.current = null;
													}
												}}
												className="flex flex-col items-center text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
												aria-label="Admin Login"
												tabIndex={0}
											>
												<LogIn size={20} />
												<span className="text-xs mt-1">Admin Login</span>
											</button>
										) : (
											<button
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
										)
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