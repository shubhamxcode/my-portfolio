import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Parallax } from 'react-scroll-parallax';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef(null);
  const innerRef   = useRef(null);
  const blobRef    = useRef(null);
  const ringRef    = useRef(null);
  const dotsRef    = useRef(null);
  const avatarRef  = useRef(null);
  const textRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(blobRef.current, { y: -100, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 2 } });
      gsap.to(ringRef.current, { y: -150, rotation: 60, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.4 } });
      gsap.to(dotsRef.current, { y: -200, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
      gsap.to(avatarRef.current, { y: -60, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });

      gsap.fromTo(innerRef.current.children,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="panel relative py-32 bg-[#111111] overflow-hidden" style={{ zIndex: 2 }}>
      <div ref={blobRef}  className="absolute -top-20 -right-40 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl pointer-events-none" />
      <div ref={ringRef}  className="absolute top-20 left-10 w-32 h-32 rounded-full border-[20px] border-white/5 pointer-events-none" />
      <div ref={dotsRef}  className="absolute bottom-20 right-20 grid grid-cols-4 gap-2 pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/10" />)}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div ref={innerRef} className="grid md:grid-cols-2 gap-16 items-center">
          <div ref={avatarRef} className="relative flex justify-center">
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              <div className="absolute inset-0 bg-white/5"
                style={{ borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%', animation: 'morph 8s ease-in-out infinite' }} />
              <Parallax translateY={[-10, 10]} className="absolute inset-6 rounded-full overflow-hidden border border-white/10">
                <img src="/myimage.jpeg" alt="Shubham Varshney" className="w-full h-full object-cover" />
              </Parallax>
              <Parallax translateY={[-25, 5]} className="absolute -top-4 -right-4">
                <div className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold shadow-lg">React</div>
              </Parallax>
              <Parallax translateY={[-15, 25]} className="absolute -bottom-2 -left-6">
                <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold">Node.js</div>
              </Parallax>
              <Parallax translateY={[10, -20]} className="absolute top-1/2 -right-10">
                <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold">TypeScript</div>
              </Parallax>
            </div>
          </div>

          <Parallax translateY={[15, -10]}>
          <div ref={textRef}>
            <p className="section-label mb-3">About Me</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Building things for the <span className="text-gray-500">web</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              I'm a Full-Stack Software Engineer from Greater Noida, UP, pursuing B.Tech in IT at NIET (AKTU). 2+ years building scalable, production-ready applications.
            </p>
            <p className="text-gray-500 leading-relaxed mb-6">
              I specialize in React, Next.js, TypeScript, and Node.js — focused on performance optimization, clean API design, and end-to-end feature ownership.
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'].map((t) => (
                <span key={t} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10">{t}</span>
              ))}
            </div>
            <a href="mailto:shubh.varshneycode@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors duration-300 shadow-lg">
              Let's Connect
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
          </Parallax>
        </div>
      </div>

      <style>{`
        @keyframes morph {
          0%,100% { border-radius:60% 40% 30% 70%/60% 30% 70% 40%; }
          25%      { border-radius:30% 60% 70% 40%/50% 60% 30% 60%; }
          50%      { border-radius:50% 60% 30% 60%/40% 50% 60% 50%; }
          75%      { border-radius:60% 40% 60% 30%/60% 40% 50% 50%; }
        }
      `}</style>
    </section>
  );
}
