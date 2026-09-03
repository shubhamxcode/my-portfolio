import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Navbar() {
  const navRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#081310]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 text-xl font-bold tracking-tight">
          <img src="/myimage.jpeg" alt="Shubham Varshney"
            className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0" />
          <span className="text-gray-700">·</span>
          <span className="text-gray-500 text-sm font-medium">Shubham</span>
        </button>

        <div className="flex items-center gap-3 md:gap-4">
          <a href="/shubhamxcode.pdf" download="Shubham-Varshney-Resume.pdf"
            className="px-4 py-1.5 text-sm font-semibold text-gray-300 border border-white/20 rounded-full hover:bg-white/10 hover:text-white transition-colors">
            Resume
          </a>
          <a data-magnetic href="mailto:shubh.varshneycode@gmail.com"
            className="px-4 py-1.5 text-sm font-semibold text-black bg-white rounded-full hover:bg-gray-200 transition-colors">
            Hire Me
          </a>
        </div>
      </div>
    </nav>
  );
}
