import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const links = ['About', 'Skills', 'Experience', 'Projects', 'Contact'];

export default function Navbar() {
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 text-xl font-bold tracking-tight">
          <img src="/myimage.jpeg" alt="Shubham Varshney"
            className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0" />
          <span className="text-gray-700">·</span>
          <span className="text-gray-500 text-sm font-medium">Shubham</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <button key={link} onClick={() => scrollTo(link)}
              className="text-sm font-medium text-gray-500 hover:text-white transition-colors duration-200 relative group">
              {link}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </button>
          ))}
          <a href="/shubham_dev__.pdf" download
            className="px-4 py-1.5 text-sm font-semibold text-gray-300 border border-white/20 rounded-full hover:bg-white/10 hover:text-white transition-colors">
            Resume
          </a>
          <a href="mailto:shubh.varshneycode@gmail.com"
            className="px-4 py-1.5 text-sm font-semibold text-black bg-white rounded-full hover:bg-gray-200 transition-colors">
            Hire Me
          </a>
        </div>

        <button className="md:hidden flex flex-col gap-1.5 p-1" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`block w-5 h-0.5 bg-gray-400 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-400 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-400 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <button key={link} onClick={() => scrollTo(link)}
              className="text-left text-base font-medium text-gray-400 hover:text-white transition-colors">{link}</button>
          ))}
        </div>
      )}
    </nav>
  );
}
