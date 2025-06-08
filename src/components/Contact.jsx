import { Mail, Linkedin, Github } from 'lucide-react';
import Email from './Email';

const Contact = () => {
  return (
    <section
      id="contact"
      className="min-h-[100vh] py-10 sm:py-20 bg-gradient-to-br from-blue-950 via-blue-300 to-blue-950 dark:from-gray-950 dark:via-gray-500 dark:to-gray-950 flex items-center justify-center text-white pb-24 sm:pb-0"
    >
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-4xl font-serif text-green-950 dark:text-white font-bold mb-4 sm:mb-6">
            To Get In Touch
          </h2>
          <br />
          <p className="font-mono text-base sm:text-xl text-black dark:text-orange-300 max-w-3xl mx-auto">
            Ready to bring your next project to life? I'd love to hear about your ideas and discuss how we can collaborate.
          </p>
        </div>

        <Email />

        <div className="font-mono flex flex-row md:flex-row gap-4 sm:gap-6 md:gap-10 justify-center mt-8 items-center">
          <div className="bg-yellow-900 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="text-black font-semibold text-sm sm:text-base">Email</div>
            <a href="mailto:wahishrey@gmail.com" className="font-bold text-blue-800 hover:text-yellow-700 dark:text-yellow-600 hover:dark:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base" aria-label="Send email to wahishrey@gmail.com">
              wahishrey@gmail.com
            </a>
          </div>
        </div>

        <div className="font-mono flex flex-row md:flex-row gap-4 sm:gap-6 md:gap-10 items-center justify-center mt-8">          
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-black font-semibold text-sm sm:text-base">LinkedIn</div>
              <a href="https://www.linkedin.com/in/shrey-wahi/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:text-yellow-700 dark:text-yellow-600 hover:dark:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base" aria-label="View LinkedIn profile">
                /in/shrey-wahi
              </a>
            </div>
          </div>

          <div className="flex items-center">
            <div className="bg-black p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
              <Github className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-black font-semibold text-sm sm:text-base">
              <div>GitHub</div>
              <a href="https://github.com/shreywahi" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:text-yellow-700 dark:text-yellow-600 hover:dark:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base" aria-label="View GitHub profile">
                /shreywahi
              </a>{" and "} 
              <a href="https://github.com/dodoshrey" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-800 hover:text-yellow-700 dark:text-yellow-600 hover:dark:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs sm:text-base" aria-label="View GitHub profile">
                /dodoshrey
              </a>
            </div>
          </div>
        </div>

        <div className="font-mono mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-gray-700 text-center">
          <p className="text-black dark:text-gray-300 text-xs sm:text-base">
            © 2025 Shrey Wahi. Built with ReactJS, Vite and passion for great user experiences.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;