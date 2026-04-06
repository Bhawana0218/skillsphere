import { motion } from "framer-motion";
import { Send } from "lucide-react"; 

const Footer = () =>{
    return(
      <footer className="bg-slate-900 text-slate-300 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 ">
                
                  <img src='../../../Logo.png' alt='SkillSphere' className='w-54 h-44 mx-auto -my-10'/>
                
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed max-w-md">
                The intelligent hyperlocal freelance ecosystem connecting talent with opportunity through AI, secure technology, and human-centered design.
              </p>
              
              <div className="mt-8">
                <label className="block text-sm font-medium text-slate-300 mb-3">Stay in the loop</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-3 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
                <p className="text-xs text-slate-500 mt-2">We respect your privacy. Unsubscribe anytime.</p>
              </div>
            </div>
            
            {[
              {
                title: "Platform",
                links: ["Browse Freelancers", "Browse Projects", "How it Works", "Pricing", "Enterprise"]
              },
              {
                title: "Resources",
                links: ["Blog", "Help Center", "Community", "Webinars", "API Docs"]
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Press", "Partners", "Contact"]
              }
            ].map((column) => (
              <div key={column.title}>
                <h4 className="text-white font-bold mb-6">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a 
                        href="#" 
                        className="text-slate-400 hover:text-cyan-400 transition-colors text-sm flex items-center gap-2 group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-cyan-400 transition-colors"></span>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-slate-500">
              &#169; {new Date().getFullYear()} SkillSphere. All rights reserved. Crafted with ❤️ for the future of work.
            </p>
            <div className="flex items-center gap-6">
              {["Terms", "Privacy", "Cookies", "Security"].map((item) => (
                <a 
                  key={item} 
                  href="/settings/security" 
                  className="text-sm text-slate-500 hover:text-cyan-400 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
            <div className="flex gap-4">
              {["twitter", "github", "linkedin", "youtube"].map((social) => (
                <a 
                  key={social}
                  href="www.example.com" 
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors group"
                  aria-label={social}
                >
                  <span className="text-slate-400 group-hover:text-white transition-colors capitalize text-sm font-bold">
                    {social[0].toUpperCase()}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
}

export default Footer;