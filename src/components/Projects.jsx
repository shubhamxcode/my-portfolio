import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Parallax } from 'react-scroll-parallax';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    name: 'PaperX', tagline: 'Paper Trading Platform',
    description: 'Paper trading platform for Indian markets with Rs.10L virtual capital and real-time NSE/BSE data via Upstox API. Live candlestick charts with 2-second polling and portfolio tracking.',
    stack: ['Next.js', 'TypeScript', 'Upstox API', 'PostgreSQL', 'Drizzle ORM', 'Tailwind CSS'],
    highlights: ['Real-time NSE/BSE data via Upstox API', 'Live candlestick charts with 2s polling', 'Secure auth + portfolio tracking'],
  },
  {
    name: 'RedCircle', tagline: 'Tokenized Reddit Posts',
    description: 'Platform to tokenize Reddit posts as tradable assets. Creators list posts, curators discover and trade. Gamified engagement system with leaderboards and rich profiles.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'PostgreSQL', 'Reddit OAuth 2.0'],
    highlights: ['Tokenize Reddit posts as tradable assets', 'Gamified leaderboards & profiles', 'Reddit OAuth 2.0 integration'],
  },
  {
    name: 'ReviewIQ', tagline: 'AI-Powered PR Review',
    description: 'AI platform that analyzes GitHub Pull Requests with code insights, refactor suggestions, and issue detection. Webhook workflow with vector embeddings for context-aware analysis.',
    stack: ['React', 'TypeScript', 'TanStack Router', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'AI API'],
    highlights: ['AI code insights & refactor suggestions', 'Webhook + vector embeddings', 'Automated static analysis'],
  },
];

export default function Projects() {
  const sectionRef = useRef(null);
  const trackRef   = useRef(null);
  const headingRef = useRef(null);
  const blobRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(blobRef.current, { y: -120, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 2 } });

      gsap.fromTo(headingRef.current, { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%' } });

      const track = trackRef.current;
      const totalWidth = track.scrollWidth - track.offsetWidth;
      gsap.to(track, { x: -totalWidth, ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current, pin: true, scrub: 1,
          end: () => `+=${totalWidth + 200}`, invalidateOnRefresh: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const onMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) / 16;
    const y = (e.clientY - rect.top  - rect.height / 2) / 16;
    gsap.to(card, { rotateY: x, rotateX: -y, duration: 0.4, ease: 'power2.out', transformPerspective: 900 });
  };
  const onMouseLeave = (e) => {
    gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
  };

  return (
    <section ref={sectionRef} id="projects" className="panel relative bg-[#0d0d0d] overflow-hidden" style={{ zIndex: 5 }}>
      <div ref={blobRef} className="absolute -bottom-20 -left-32 w-[500px] h-[500px] rounded-full bg-white/3 blur-3xl pointer-events-none" />

      <div className="relative z-10 pt-24 pb-8 max-w-6xl mx-auto px-6">
        <Parallax translateY={[25, -10]}>
          <div ref={headingRef} className="text-center mb-16">
            <p className="section-label mb-3">What I've Built</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Featured <span className="text-gray-600">Projects</span></h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">Scroll down to slide through projects →</p>
          </div>
        </Parallax>
      </div>

      <div className="relative z-10 px-6 pb-24 overflow-hidden">
        <div ref={trackRef} className="flex gap-6" style={{ width: 'max-content', perspective: 1000 }}>
          {projects.map((proj, i) => {
            const yVals = [[30, -5], [35, -3], [28, -7]];
            const oVals = [[0.6, 1], [0.55, 1], [0.65, 1]];
            return (
            <Parallax key={proj.name} translateY={yVals[i]} opacity={oVals[i]} style={{ flexShrink: 0 }}>
            <div
              className="w-[360px] md:w-[420px] rounded-3xl overflow-hidden glass-card cursor-pointer"
              onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
              style={{ transformStyle: 'preserve-3d' }}>
              <div className="h-px w-full bg-white/20" />
              <div className="p-8">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{proj.name}</h3>
                    <p className="text-sm font-semibold mt-1 text-gray-500">{proj.tagline}</p>
                  </div>
                  <a href="#" onClick={(e) => e.preventDefault()}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-gray-500 hover:text-gray-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{proj.description}</p>
                <ul className="space-y-2 mb-6">
                  {proj.highlights.map((h, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-gray-400">
                      <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-[10px]">✓</span>
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1.5 pt-5 border-t border-white/5">
                  {proj.stack.map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-gray-500 font-medium border border-white/10">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            </Parallax>
            );
          })}
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-px rounded-full transition-all duration-300 ${i === 0 ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
