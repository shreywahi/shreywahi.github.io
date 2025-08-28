import { useState } from "react";
import { Linkedin, Github } from 'lucide-react';
import Email from './Email';

const Contact = ({ isAdmin, heading, setHeading, intro, setIntro }) => {
  const [editMode, setEditMode] = useState(false);
  const [tempHeading, setTempHeading] = useState(heading);
  const [tempIntro, setTempIntro] = useState(intro);

  return (
    <section
      id="contact"
      className="min-h-[100vh] py-10 sm:py-20 flex items-center justify-center pb-24 sm:pb-0"
    >
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          {isAdmin && editMode ? (
            <div>
              <input
                value={tempHeading}
                onChange={e => setTempHeading(e.target.value)}
                className="w-full mb-2 p-2 rounded border text-2xl font-serif text-center"
                placeholder="Contact Heading"
                style={{ background: "#f9fafb", color: "#222", border: "1px solid #cbd5e1" }}
              />
              <textarea
                value={tempIntro}
                onChange={e => setTempIntro(e.target.value)}
                className="w-full mb-2 p-2 rounded border font-mono"
                rows={2}
                placeholder="Contact Intro"
                style={{ background: "#f9fafb", color: "#222", border: "1px solid #cbd5e1" }}
              />
              <button
                onClick={() => { setHeading(tempHeading); setIntro(tempIntro); setEditMode(false); }}
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
              <h2 className="text-4xl font-serif text-black dark:text-purple-500 font-bold mb-4 sm:mb-6">
                {heading}
              </h2>
              <br />
              <p className="font-mono text-base sm:text-xl text-slate-600 dark:text-indigo-100 max-w-3xl mx-auto">
                {intro}
              </p>
              {isAdmin && !editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-3 px-4 py-2 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
                  style={{ marginTop: 12 }}
                >
                  Edit
                </button>
              )}
            </>
          )}
        </div>

        <Email />

        <div className="font-mono flex flex-row md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center mt-8">          
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">LinkedIn</div>
              <a href="https://www.linkedin.com/in/shrey-wahi/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-400 hover:text-yellow-700 dark:text-yellow-600 hover:dark:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base" aria-label="View LinkedIn profile">
                /in/shrey-wahi
              </a>
            </div>
          </div>

          <div className="flex items-center">
            <div className="bg-black p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <Github className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-slate-900 dark:text-white font-semibold text-sm sm:text-base">
              <div>GitHub Accounts</div>
              <a href="https://github.com/shreywahi" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-400 hover:text-yellow-700 dark:text-yellow-600 hover:dark:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base" aria-label="View GitHub profile">
                /shreywahi
              </a>{" and "} 
              <a href="https://github.com/dodoshrey" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-400 hover:text-yellow-700 dark:text-yellow-600 hover:dark:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base" aria-label="View GitHub profile">
                /dodoshrey
              </a>
            </div>
          </div>
        </div>

        <div className="font-mono mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-700 text-center">
          <p className="text-slate-600 dark:text-gray-300 text-xs sm:text-base">
            © 2025 Shrey Wahi. Built with ReactJS, Vite and passion for great user experiences.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;