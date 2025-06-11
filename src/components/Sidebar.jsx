import React, { useState, useRef, useEffect } from 'react';
import { Github, Linkedin, Mail, Sun, Moon, Home, User, FolderKanban, Mail as MailIcon, Briefcase, MoreHorizontal, Award, Layers, Smartphone, FileText, LogIn, LogOut } from 'lucide-react';
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

const Sidebar = ({ onNavigate, activeSection, setShowLogin, isAdmin, signOut, auth }) => {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const sidebarRef = useRef(null);
	const openButtonRef = useRef(null);	const [screenSize, setScreenSize] = useState('desktop');	const [showMoreMenu, setShowMoreMenu] = useState(false);
	const [showAlternateButtons, setShowAlternateButtons] = useState(false);
	const moreButtonRef = useRef(null);
	const moreMenuRef = useRef(null);	useEffect(() => {
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
	}, []);

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
						<br /><br />
						<div
							className="flex items-center justify-center h-24 text-3xl font-bold text-white tracking-wide hover:text-blue-700 transition-colors cursor-pointer"
							onClick={() => {
								if (onNavigate) onNavigate('hero');
							}}
							tabIndex={0}
							aria-label="Go to Home"
							role="button"
							onKeyDown={e => {
								if (e.key === "Enter" || e.key === " ") {
									if (onNavigate) onNavigate('hero');
								}
							}}
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
						</nav>
						{/* Admin Login/Exit Admin button (desktop) */}
						<div className="flex justify-center my-4">
							{!isAdmin ? (
								<button
									onClick={() => setShowLogin(true)}
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
							<a
								href="https://drive.google.com/uc?export=download&id=1FUFbRulij4fiG6oSb_dS6hqKEGz95Ok0"
								className="flex items-center gap-2 px-4 py-2 w-44 justify-center rounded-lg bg-gray-900 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
								aria-label="Download Apk"
								target="_blank"
								rel="noopener noreferrer"
								tabIndex={0}
							>
								Download Apk
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
			)}			{/* Mobile/tablet sticky footer nav */}
			{(screenSize === 'mobile' || screenSize === 'tablet') && (
				<nav
					className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur flex justify-around items-center h-16 border-t border-blue-300"
					aria-label="Footer Navigation"
				>
					<button
						onClick={() => { 
							if (showAlternateButtons) {
								if (onNavigate) onNavigate('projects');
							} else {
								if (onNavigate) onNavigate('hero');
							}
						}}
						className={`flex flex-col items-center px-2 focus:outline-none focus:ring-2 focus:ring-blue-400
							${(showAlternateButtons ? activeSection === 'projects' : activeSection === 'hero')
								? 'text-blue-400'
								: 'text-white hover:text-blue-400'}
						`}
						aria-label={showAlternateButtons ? "Projects" : "Home"}
						tabIndex={0}
					>
						{showAlternateButtons ? <FolderKanban size={24} /> : <Home size={24} />}
						<span className="text-xs mt-1">{showAlternateButtons ? "Projects" : "Home"}</span>
					</button>
					<button
						onClick={() => { 
							if (showAlternateButtons) {
								if (onNavigate) onNavigate('certs');
							} else {
								if (onNavigate) onNavigate('about');
							}
						}}
						className={`flex flex-col items-center px-2 focus:outline-none focus:ring-2 focus:ring-blue-400
							${(showAlternateButtons ? activeSection === 'certs' : activeSection === 'about')
								? 'text-blue-400'
								: 'text-white hover:text-blue-400'}
						`}
						aria-label={showAlternateButtons ? "Certificates" : "About"}
						tabIndex={0}
					>
						{showAlternateButtons ? <Award size={24} /> : <User size={24} />}
						<span className="text-xs mt-1">{showAlternateButtons ? "Certificates" : "About"}</span>
					</button>					{/* More button and its popup */}
					<div className="relative flex flex-col items-center">
						<button
							ref={moreButtonRef}
							onClick={() => {
								setShowAlternateButtons(prev => !prev);
								setShowMoreMenu(prev => !prev);
							}}
							className={`flex flex-col items-center px-2 focus:outline-none focus:ring-2 focus:ring-blue-400
								${showMoreMenu
									? 'text-blue-400'
									: 'text-white hover:text-blue-400'}
							`}
							aria-label="Toggle navigation options and settings menu"
							tabIndex={0}
						>
							<MoreHorizontal size={24} />
							<span className="text-xs mt-1">More</span>
						</button>
						{showMoreMenu && (
							<div
								ref={moreMenuRef}
								className="absolute bottom-14 flex flex-col items-center gap-2 z-50 bg-gray-900 rounded-xl shadow-lg px-2 py-3"
							>								<div className="flex flex-col gap-6 py-1 px-2">
									<button
										onClick={() => {
											setTheme(resolvedTheme === "dark" ? "light" : "dark");
											setShowMoreMenu(false);
										}}
										className="flex flex-col items-center text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
										aria-label="Toggle theme"
										tabIndex={0}
									>
										{resolvedTheme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
										<span className="text-xs mt-1">Theme</span>
									</button>
									{/* Download Apk */}
									<button
										onClick={() => {
											window.open("https://drive.google.com/uc?export=download&id=1FUFbRulij4fiG6oSb_dS6hqKEGz95Ok0", "_blank", "noopener,noreferrer");
											setShowMoreMenu(false);
										}}
										className="flex flex-col items-center text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
										aria-label="Download Apk"
										tabIndex={0}
									>
										{/* Use a smartphone icon for APK */}
										<Smartphone size={24} />
										<span className="text-xs mt-1">Download APK</span>
									</button>
									{/* Admin Login/Exit Admin button (mobile/tablet) */}
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
									)}
								</div>
							</div>
						)}
					</div>
					<button
						onClick={() => { 
							if (showAlternateButtons) {
								if (onNavigate) onNavigate('contact');
							} else {
								if (onNavigate) onNavigate('experience');
							}
						}}
						className={`flex flex-col items-center px-2 focus:outline-none focus:ring-2 focus:ring-blue-400
							${(showAlternateButtons ? activeSection === 'contact' : activeSection === 'experience')
								? 'text-blue-400'
								: 'text-white hover:text-blue-400'}
						`}
						aria-label={showAlternateButtons ? "Contact" : "Experience"}
						tabIndex={0}
					>
						{showAlternateButtons ? <MailIcon size={24} /> : <Briefcase size={24} />}
						<span className="text-xs mt-1">{showAlternateButtons ? "Contact" : "Experience"}</span>
					</button>
					<button
						onClick={() => { 
							if (showAlternateButtons) {
								window.open("https://drive.google.com/uc?export=download&id=1S0nqdpUimw_mBBQNxVdTZzinGrdFv7Xg", "_blank", "noopener,noreferrer");
							} else {
								if (onNavigate) onNavigate('skills');
							}
						}}
						className={`flex flex-col items-center px-2 focus:outline-none focus:ring-2 focus:ring-blue-400
							${(!showAlternateButtons && activeSection === 'skills')
								? 'text-blue-400'
								: 'text-white hover:text-blue-400'}
						`}
						aria-label={showAlternateButtons ? "Download Resume" : "Skills"}
						tabIndex={0}
					>
						{showAlternateButtons ? <FileText size={24} /> : <Layers size={24} />}
						<span className="text-xs mt-1">{showAlternateButtons ? "Download Resume" : "Skills"}</span>
					</button>
				</nav>
			)}
		</>
	);
};

export default Sidebar;