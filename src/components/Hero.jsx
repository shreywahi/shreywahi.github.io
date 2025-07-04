import { useState, useEffect } from "react";
import { Download, Mail, Smartphone } from "lucide-react";

const Hero = ({ onNavigate, isAdmin, heroName, heroDesc, updateHero }) => {
  const [editMode, setEditMode] = useState(false);
  const [tempName, setTempName] = useState(heroName);
  const [tempDesc, setTempDesc] = useState(heroDesc);

  // Keep temp fields in sync with props when entering edit mode or when props change
  useEffect(() => {
    if (editMode) {
      setTempName(heroName);
      setTempDesc(heroDesc);
    }
  }, [editMode, heroName, heroDesc]);
  return (
    <section id="hero" className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-300 to-blue-950 dark:from-gray-950 dark:via-gray-500 dark:to-blue-950 pb-24 sm:pb-0 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 text-center w-full">
        <div className="animate-fade-in w-full">
          <br /><br />
          {isAdmin && editMode ? (
            <div>
              <input
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                className="w-full mb-2 p-2 rounded border text-4xl font-serif text-center"
                placeholder="Your Name"
                style={{ background: "#f9fafb", color: "#222", border: "1px solid #cbd5e1" }}
              />
              <textarea
                value={tempDesc}
                onChange={e => setTempDesc(e.target.value)}
                className="w-full mb-2 p-2 rounded border text-lg font-mono"
                rows={4}
                placeholder="Hero Description"
                style={{ background: "#f9fafb", color: "#222", border: "1px solid #cbd5e1" }}
              />              <button
                onClick={async () => { 
                  if (updateHero) {
                    await updateHero(tempName, tempDesc);
                  }
                  setEditMode(false); 
                }}
                className="mr-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Save
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 rounded bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-6xl sm:text-8xl font-serif text-gray-900 dark:text-white mb-6 tracking-tight">
                {heroName && heroName.split(" ")[0]}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400">
                  {" "}{heroName && heroName.split(" ").slice(1).join(" ")}{" "}
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-3xl font-mono text-gray-900 dark:text-purple-200 leading-relaxed">
                <br />
                <b>{heroDesc}</b>
                <br /><br /><br /><br />
              </p>
              {isAdmin && !editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="mb-4 px-4 py-2 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
                  style={{ marginBottom: 16 }}
                >
                  Edit
                </button>
              )}
            </>
          )}          <div className="flex flex-col xl:flex-row gap-4 xl:gap-6 justify-center items-center mb-8 sm:mb-16 w-full max-w-4xl mx-auto">
            <button
              className="bg-blue-700 text-white px-6 lg:px-10 py-3 lg:py-5 rounded-xl text-lg lg:text-xl font-semibold hover:bg-blue-800 transition-all duration-300 transform hover:scale-105 shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 w-full xl:w-auto min-w-0"
              aria-label="Download Resume PDF"
            >
              <a href="https://drive.google.com/uc?export=download&id=1S0nqdpUimw_mBBQNxVdTZzinGrdFv7Xg" className="flex items-center justify-center gap-3 min-w-0">
                <Download size={20} />
                <span className="truncate">Resume PDF</span>
              </a>
            </button>            
            <button
              className="bg-yellow-700 text-white px-6 lg:px-10 py-3 lg:py-5 rounded-xl text-lg lg:text-xl font-semibold hover:bg-yellow-800 transition-all duration-300 transform hover:scale-105 shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 w-full xl:w-auto min-w-0"
              aria-label="Get WebApp Apk"
            >
              <a href="https://drive.google.com/uc?export=download&id=1FUFbRulij4fiG6oSb_dS6hqKEGz95Ok0" className="flex items-center justify-center gap-3 min-w-0">
                <Smartphone size={20} />
                <span className="truncate">Portfolio Apk</span>
              </a>
            </button>
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('contact');
                } else {
                  const el = document.getElementById('contact');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}              className="border-2 border-gray-700 dark:border-gray-200 text-gray-900 dark:text-gray-200 px-6 lg:px-10 py-3 lg:py-5 rounded-xl text-lg lg:text-xl font-semibold hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center gap-3 justify-center w-full xl:w-auto min-w-0"
              aria-label="Scroll to Contact section"
              >
              <Mail size={20} />
              <span className="truncate">Get In Touch</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;