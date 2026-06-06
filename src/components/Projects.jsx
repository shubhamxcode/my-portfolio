import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Parallax } from 'react-scroll-parallax';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    name: 'PaperX', tagline: 'Paper Trading Platform', href: 'https://www.paperx.xyz',
    description: 'Paper trading platform for Indian markets with Rs.10L virtual capital and real-time NSE/BSE data via Upstox API. Live candlestick charts with 2-second polling and portfolio tracking.',
    stack: ['Next.js', 'TypeScript', 'Upstox API', 'PostgreSQL', 'Drizzle ORM', 'Tailwind CSS'],
    highlights: ['Real-time NSE/BSE data via Upstox API', 'Live candlestick charts with 2s polling', 'Secure auth + portfolio tracking'],
  },
  {
    name: 'RedCircle', tagline: 'Tokenized Reddit Posts', href: 'https://www.redcircle.lol/home',
    description: 'Platform to tokenize Reddit posts as tradable assets. Creators list posts, curators discover and trade. Gamified engagement system with leaderboards and rich profiles.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'PostgreSQL', 'Reddit OAuth 2.0'],
    highlights: ['Tokenize Reddit posts as tradable assets', 'Gamified leaderboards & profiles', 'Reddit OAuth 2.0 integration'],
  },
  {
    name: 'ReviewIQ', tagline: 'AI-Powered PR Review', href: 'https://www.reviewiq.xyz',
    description: 'AI platform that analyzes GitHub Pull Requests with code insights, refactor suggestions, and issue detection. Webhook workflow with vector embeddings for context-aware analysis.',
    stack: ['React', 'TypeScript', 'TanStack Router', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'AI API'],
    highlights: ['AI code insights & refactor suggestions', 'Webhook + vector embeddings', 'Automated static analysis'],
  },
  {
    name: 'Devbond', tagline: 'Developer Networking Platform', href: 'https://github.com/shubhamvarshney',
    description: 'Developer networking platform for engineers to connect and collaborate. Real-time communication powered by WebSockets enables live interaction between developers.',
    stack: ['MongoDB', 'Express', 'React', 'Node.js', 'REST APIs', 'JWT', 'WebSocket'],
    highlights: ['Developer networking & collaboration', 'Real-time chat via WebSocket', 'Secure JWT authentication'],
  },
];

export default function Projects() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const blobRef    = useRef(null);
  const trackRef   = useRef(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const isDragging  = useRef(false);
  const dragStartX  = useRef(0);
  const scrollStart = useRef(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(blobRef.current, { y: -120, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 2 } });

      gsap.fromTo(headingRef.current, { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%' } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = el.offsetWidth;
      setActiveIdx(Math.round(el.scrollLeft / cardWidth));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const onMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.pageX;
    scrollStart.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = 'grabbing';
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.pageX - dragStartX.current;
    trackRef.current.scrollLeft = scrollStart.current - dx;
  };
  const onMouseUp = () => {
    isDragging.current = false;
    trackRef.current.style.cursor = 'grab';
  };

  const onCardMouseMove = (e) => {
    if (isDragging.current) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width  / 2) / 16;
    const y = (e.clientY - rect.top  - rect.height / 2) / 16;
    gsap.to(card, { rotateY: x, rotateX: -y, duration: 0.4, ease: 'power2.out', transformPerspective: 900 });
  };
  const onCardMouseLeave = (e) => {
    gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
  };

  const scrollTo = (i) => {
    const el = trackRef.current;
    el.scrollTo({ left: i * el.offsetWidth, behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} id="projects" className="panel relative bg-[#0d0d0d] overflow-hidden" style={{ zIndex: 5 }}>
      <div ref={blobRef} className="absolute -bottom-20 -left-32 w-[500px] h-[500px] rounded-full bg-white/3 blur-3xl pointer-events-none" />

      <div className="relative z-10 pt-24 pb-8 max-w-6xl mx-auto px-6">
        <Parallax translateY={[25, -10]}>
          <div ref={headingRef} className="text-center mb-16">
            <p className="section-label mb-3">What I've Built</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Featured <span className="text-gray-600">Projects</span></h2>
          </div>
        </Parallax>
      </div>

      <div className="relative z-10 pb-24">
        <div
          ref={trackRef}
          className="flex overflow-x-auto gap-6 px-6 select-none"
          style={{
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            cursor: 'grab',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {projects.map((proj) => (
            <div
              key={proj.name}
              className="flex-shrink-0 w-[85vw] md:w-[420px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div
                className="rounded-3xl overflow-hidden glass-card h-full"
                onMouseMove={onCardMouseMove}
                onMouseLeave={onCardMouseLeave}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="h-px w-full bg-white/20" />
                <div className="p-8">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{proj.name}</h3>
                      <p className="text-sm font-semibold mt-1 text-gray-500">{proj.tagline}</p>
                    </div>
                    <a href={proj.href} target="_blank" rel="noopener noreferrer"
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
            </div>
          ))}
          <div className="flex-shrink-0 w-6" />
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-px rounded-full transition-all duration-300 ${i === activeIdx ? 'w-8 bg-white' : 'w-2 bg-white/20'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
