import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Fireflies } from './Scenery';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    name: 'Souji', tagline: 'Siri-Style AI Assistant for macOS', href: 'https://github.com/shubhamxcode',
    description: 'AI assistant for macOS with voice control, an LLM brain, screen vision, and natural-language Mac automation backed by local-first memory. Includes an autonomous job-application agent shipped as a Chrome extension.',
    stack: ['Swift', 'Python', 'Chrome Extension (MV3)', 'Gemini API', 'Whisper'],
    highlights: ['Voice control + LLM brain + screen vision', 'Autonomous job-application agent that ranks jobs & auto-applies', 'Natural-language Mac automation with local-first memory'],
    cover: 'cover-rings',
  },
  {
    name: 'PaperX', tagline: 'Paper Trading Platform', href: 'https://www.paperx.xyz',
    description: 'Paper trading platform for Indian markets with Rs.10L virtual capital, real-time NSE/BSE data, and live TradingView candlestick charts. An AI trading mentor reviews virtual trades and explains market moves in plain language.',
    stack: ['Next.js', 'TypeScript', 'Upstox API', 'PostgreSQL', 'Drizzle ORM', 'Tailwind CSS'],
    highlights: ['Real-time NSE/BSE data via Upstox API', 'Live TradingView candlestick charts', 'AI trading mentor that reviews trades risk-free'],
    cover: 'cover-bars',
  },
  {
    name: 'RedCircle', tagline: 'Social Token Platform', href: 'https://github.com/shubhamxcode',
    description: 'Platform that transforms Reddit and X posts into tradable SPL tokens on Solana, connecting creators who list posts with curators who discover and trade them.',
    stack: ['React', 'Next.js', 'Node.js', 'Express', 'PostgreSQL', 'Solana'],
    highlights: ['Reddit and X posts tokenized as SPL tokens', 'Creator listing and curator discovery flows', 'Full-stack platform built on Solana'],
    cover: 'cover-grid',
  },
  {
    name: 'DevBond', tagline: 'Developer Networking Platform', href: 'https://github.com/shubhamvarshney',
    description: 'Developer networking platform with AI-powered résumé parsing that auto-builds rich developer profiles for smarter matching. Real-time communication powered by Socket.IO enables live developer interactions.',
    stack: ['MongoDB', 'Express', 'React', 'Node.js', 'REST APIs', 'JWT', 'Socket.IO'],
    highlights: ['AI résumé parsing auto-builds rich profiles', 'Real-time chat via Socket.IO', 'Secure JWT authentication'],
    cover: 'cover-dots',
  },
];

export default function Projects() {
  const sectionRef  = useRef(null);
  const trackRef    = useRef(null);
  const counterRef  = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const covers = track.querySelectorAll('[data-cover-art]');

      gsap.to(track, {
        x: () => -(track.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (counterRef.current) {
              const idx = Math.min(projects.length, Math.max(1, Math.round(self.progress * (projects.length - 1)) + 1));
              counterRef.current.textContent = String(idx).padStart(2, '0');
            }
            if (progressRef.current) gsap.set(progressRef.current, { scaleX: self.progress });
            // Depth parallax: cover pattern drifts against travel direction
            covers.forEach((cover) => {
              const r = cover.getBoundingClientRect();
              const offset = (r.left + r.width / 2 - window.innerWidth / 2) / window.innerWidth;
              gsap.set(cover, { x: offset * 60, backgroundPosition: `${offset * 120}px center` });
            });
          },
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const onCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) / 18;
    const y = (e.clientY - rect.top  - rect.height / 2) / 18;
    gsap.to(card, { rotateY: x, rotateX: -y, duration: 0.4, ease: 'power2.out', transformPerspective: 900 });
  };
  const onCardMouseLeave = (e) => {
    gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
  };

  return (
    <section ref={sectionRef} id="projects" className="panel relative bg-[#0b1813]"
      style={{ zIndex: 5, height: '340vh' }}>
      <div className="h-screen overflow-hidden flex flex-col justify-center relative">
        <Fireflies count={8} />

        {/* Ghost title behind the cards */}
        <div className="absolute top-10 left-0 right-0 text-center pointer-events-none select-none">
          <span className="display text-[16vw] leading-none outline-text opacity-40">WORK</span>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full mb-10 flex items-end justify-between">
          <div>
            <p className="section-label mb-3">What I've Built</p>
            <h2 data-split className="text-4xl md:text-5xl font-bold text-white">
              Featured <span className="text-gray-600">Projects</span>
            </h2>
          </div>
          <div className="hidden md:flex items-baseline gap-1 display text-white/60">
            <span ref={counterRef} className="text-5xl text-white">01</span>
            <span className="text-2xl text-white/30">/ {String(projects.length).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Horizontal track — driven by vertical scroll */}
        <div ref={trackRef} className="relative z-10 flex gap-8 pl-6 md:pl-[8vw] pr-[12vw] w-max will-change-transform">
          {projects.map((proj, i) => (
            <div key={proj.name} className="w-[85vw] md:w-[560px] shrink-0">
              <div
                className="rounded-3xl overflow-hidden glass-card h-full group"
                onMouseMove={onCardMouseMove}
                onMouseLeave={onCardMouseLeave}
                style={{ transformStyle: 'preserve-3d' }}>

                {/* Cover art — pure CSS pattern + giant index, drifts with parallax */}
                <div className="relative h-44 md:h-56 overflow-hidden border-b border-white/5">
                  <div data-cover-art
                    className={`absolute -inset-x-16 inset-y-0 ${proj.cover} transition-transform duration-700 group-hover:scale-105`} />
                  <span className="display absolute -bottom-6 right-4 text-[7rem] md:text-[9rem] leading-none outline-text opacity-70 select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="display absolute top-5 left-6 text-6xl md:text-7xl text-white/90 leading-none select-none">
                    {proj.name.charAt(0)}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                </div>

                <div className="p-7 md:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{proj.name}</h3>
                      <p className="text-sm font-semibold mt-1 text-gray-500">{proj.tagline}</p>
                    </div>
                    <a href={proj.href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${proj.name}`}
                      className="p-2.5 rounded-full bg-white/5 hover:bg-white hover:text-black transition-colors text-gray-400">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{proj.description}</p>
                  <ul className="space-y-2 mb-5">
                    {proj.highlights.map((h, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-gray-400">
                        <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-[10px]">✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
                    {proj.stack.map((s) => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-gray-500 font-medium border border-white/10">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* End card — CTA */}
          <div className="w-[70vw] md:w-[420px] shrink-0 flex items-center justify-center">
            <a href="https://github.com/shubhamxcode" target="_blank" rel="noopener noreferrer" data-magnetic
              className="group flex flex-col items-center gap-4 text-center">
              <span className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <span className="display text-4xl text-white/80">See more on GitHub</span>
            </a>
          </div>
        </div>

        {/* Progress line */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full mt-12">
          <div className="h-px bg-white/10 w-full">
            <div ref={progressRef} className="h-px bg-white origin-left" style={{ transform: 'scaleX(0)' }} />
          </div>
          <p className="mt-3 text-[10px] tracking-[0.3em] uppercase text-gray-600">Scroll to explore</p>
        </div>
      </div>
    </section>
  );
}
