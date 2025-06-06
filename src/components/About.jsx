import { Code, Users, Zap } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="min-h-[100vh] py-10 sm:py-16 bg-blue-950 dark:bg-gray-950 flex items-center justify-center pb-24 sm:pb-0">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8">

        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-4xl font-serif font-bold text-orange-400 dark:text-purple-500 mb-4 sm:mb-6">
            About Me
          </h2>
        </div>

        <div className="grid md:grid-cols-1 gap-6 sm:gap-12 items-center">          
          <div className="space-y-4 sm:space-y-6">

            <p className="text-base sm:text-lg font-mono text-purple-500 dark:text-orange-400 leading-relaxed text-justify">
              I am a Software Engineer at Microsoft, specializing in UX Engineering. I leverage my expertise in frontend development to craft secure,
              intuitive, and high-performance web applications. My approach blends creative design principles with robust technical execution, 
              consistently prioritizing an exceptional user experience alongside stringent security measures.
            </p>
            
            <p className="text-base sm:text-lg font-mono text-purple-500 dark:text-orange-400 leading-relaxed text-justify">
              With over four years of experience, I am proficient in ReactJS, TypeScript, and various cloud technologies. My daily work involves
              enhancing security solutions and designing user interfaces that safeguard millions of users without compromising on a seamless experience.
              I also focus on optimizing application performance and architecting scalable frontend solutions.
            </p>
            
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-8">
              <div className="text-center p-4 sm:p-6 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <Code className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-300 mx-auto mb-2 sm:mb-3" />
                <h3 className="font-sans text-base sm:text-lg text-gray-900 dark:text-white">Clean Code</h3>
                <p className="font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">Writing maintainable scalable solutions</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-300 mx-auto mb-2 sm:mb-3" />
                <h3 className="font-sans text-base sm:text-lg text-gray-900 dark:text-white">Collaboration</h3>
                <p className="font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">Working seamlessly across teams</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-green-50 dark:bg-green-900 rounded-lg">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-300 mx-auto mb-2 sm:mb-3" />
                <h3 className="font-sans text-base sm:text-lg text-gray-900 dark:text-white">Performance</h3>
                <p className="font-mono text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">Optimizing for speed and efficiency</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default About;