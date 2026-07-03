import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const socials = [
  { label: 'GitHub',   href: 'https://github.com/shubhamxcode' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shubhamxcode/' },
  { label: 'X',        href: 'https://x.com/shubhamXcode' },
];

export default function Footer() {
  const sectionRef = useRef(null);
  const bigRef     = useRef(null);
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(bigRef.current, { y: 90, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power4.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer ref={sectionRef} className="panel relative bg-black border-t border-white/5 overflow-hidden pt-24 pb-10" style={{ zIndex: 7 }}>
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[380px] rounded-full bg-white/4 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <p className="section-label text-center mb-6">Have a project in mind?</p>

        <div ref={bigRef} className="text-center mb-16">
          <a href="mailto:shubh.varshneycode@gmail.com" data-magnetic
            className="display fill-hover inline-block text-[17vw] md:text-[11vw] leading-[0.95] tracking-wide select-none">
            LET'S TALK
          </a>
          <p className="mt-6 text-gray-500 text-sm md:text-base">
            shubh.varshneycode@gmail.com · +91 7417426494
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div className="flex items-center gap-6">
            {socials.map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-white transition-colors font-medium relative group">
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium tabular-nums">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Greater Noida, IN · {time} IST
          </div>

          <button data-magnetic
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors font-medium">
            Back to top
            <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </span>
          </button>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-700">
            © {new Date().getFullYear()} <span className="font-semibold text-gray-500">Shubham Varshney</span>. All rights reserved.
          </p>
          <p className="text-xs text-gray-700">Designed & built with React · GSAP · Tailwind</p>
        </div>
      </div>
    </footer>
  );
}
