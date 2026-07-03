import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Parallax } from 'react-scroll-parallax';

gsap.registerPlugin(ScrollTrigger);

const words = ['Full-Stack Engineer', 'React Developer', 'Next.js Builder', 'AI Agent Builder'];
const SCRAMBLE_CHARS = '!<>-_\\/[]{}=+*^?#';

// Star positions as box-shadows — computed once per page load, rendered as 3 depth layers
const genStars = (n) =>
  Array.from({ length: n }, () =>
    `${(Math.random() * 100).toFixed(1)}vw ${(Math.random() * 100).toFixed(1)}vh rgba(255,255,255,${(0.3 + Math.random() * 0.7).toFixed(2)})`
  ).join(', ');

const STAR_LAYERS = [
  { shadows: genStars(70), size: 1,   duration: '3s' },
  { shadows: genStars(45), size: 1.5, duration: '5s' },
  { shadows: genStars(25), size: 2,   duration: '7s' },
];

export default function Hero() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const bgZoomRef  = useRef(null);
  const overlayRef = useRef(null);
  const orb1Ref    = useRef(null);
  const orb2Ref    = useRef(null);
  const orb3Ref    = useRef(null);
  const gridRef    = useRef(null);
  const nameRef    = useRef(null);
  const tagRef     = useRef(null);
  const descRef    = useRef(null);
  const ctaRef     = useRef(null);
  const wordRef    = useRef(null);
  const wordIndex  = useRef(0);

  // GSAP scroll & intro animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro stagger
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.3 });
      tl.fromTo(nameRef.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 })
        .fromTo(tagRef.current,  { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.7')
        .fromTo(descRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
        .fromTo(ctaRef.current,  { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4');

      const st = { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1 };

      // Content fades out and lifts
      gsap.to(contentRef.current, { y: -160, scale: 0.9, opacity: 0, ease: 'none', scrollTrigger: st });

      // Background ZOOMS IN — the "dive through" effect
      gsap.set(bgZoomRef.current, { scale: 1 });
      gsap.to(bgZoomRef.current, {
        scale: 2.2,
        ease: 'none',
        scrollTrigger: { ...st, scrub: 1.2 },
      });

      // Vignette tunnel darkens edges as we zoom
      gsap.to(overlayRef.current, {
        opacity: 1,
        ease: 'none',
        scrollTrigger: { ...st, scrub: 0.8 },
      });

      // Individual orb parallax
      gsap.to(orb1Ref.current, { y: -60,  ease: 'none', scrollTrigger: { ...st, scrub: 2.5 } });
      gsap.to(orb2Ref.current, { y: -120, ease: 'none', scrollTrigger: { ...st, scrub: 1.8 } });
      gsap.to(orb3Ref.current, { y: -200, ease: 'none', scrollTrigger: { ...st, scrub: 1.0 } });
      gsap.to(gridRef.current, { y: -50, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '70% top', scrub: 1 } });

      // Idle float
      gsap.to(orb1Ref.current, { y: '+=22', duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to(orb2Ref.current, { y: '+=16', duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });
    }, sectionRef);

    // Word rotator — scramble/decode effect
    let scrambleId = null;
    const interval = setInterval(() => {
      wordIndex.current = (wordIndex.current + 1) % words.length;
      const next = words[wordIndex.current];
      const totalFrames = 18;
      let frame = 0;
      clearInterval(scrambleId);
      scrambleId = setInterval(() => {
        frame++;
        if (!wordRef.current || frame >= totalFrames) {
          if (wordRef.current) wordRef.current.textContent = next;
          clearInterval(scrambleId);
          return;
        }
        const revealed = Math.floor((frame / totalFrames) * next.length);
        wordRef.current.textContent = next.split('').map((c, i) =>
          c === ' ' ? ' ' : i < revealed ? c : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0]
        ).join('');
      }, 35);
    }, 3000);

    // Mouse parallax on orbs
    const onMouse = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      gsap.to(orb1Ref.current, { x: x * 0.5,  duration: 1.5, ease: 'power2.out', overwrite: false });
      gsap.to(orb2Ref.current, { x: -x * 0.4, duration: 2,   ease: 'power2.out', overwrite: false });
      gsap.to(orb3Ref.current, { x: x * 0.9,  duration: 1,   ease: 'power2.out', overwrite: false });
    };
    window.addEventListener('mousemove', onMouse);
    return () => { ctx.revert(); clearInterval(interval); clearInterval(scrambleId); window.removeEventListener('mousemove', onMouse); };
  }, []);

  return (
    <section ref={sectionRef} id="hero" className="panel relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]" style={{ zIndex: 1 }}>

      {/* Zoomable background layer */}
      <div ref={bgZoomRef} className="absolute inset-0 w-full h-full" style={{ transformOrigin: 'center center', willChange: 'transform' }}>
        {/* Starfield — 3 depth layers, twinkle at different rates, zoom with the dive */}
        {STAR_LAYERS.map((layer, i) => (
          <div key={i} className="star-layer"
            style={{ width: layer.size, height: layer.size, boxShadow: layer.shadows, animationDuration: layer.duration }} />
        ))}
        {/* Dot grid — zooms with the container */}
        <div ref={gridRef} className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)', backgroundSize: '36px 36px' }} />
        {/* Radial glow burst from center — gives zoom a sense of depth */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
        <div ref={orb1Ref} className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div ref={orb2Ref} className="absolute bottom-1/3 -right-32 w-[450px] h-[450px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div ref={orb3Ref} className="absolute top-2/3 left-1/3 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      </div>

      {/* Shooting stars — streak across at staggered intervals */}
      <div className="shooting-star" style={{ top: '15%', left: '70%', animationDelay: '2s' }} />
      <div className="shooting-star" style={{ top: '8%',  left: '45%', animationDelay: '7s',  animationDuration: '11s' }} />
      <div className="shooting-star" style={{ top: '32%', left: '88%', animationDelay: '13s', animationDuration: '14s' }} />

      {/* Vignette tunnel overlay — fades in on scroll, darkens edges to simulate zooming into a portal */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.97) 100%)',
          zIndex: 2,
        }}
      />

      {/* Hero content */}
      <div ref={contentRef} className="relative max-w-6xl mx-auto px-6 py-32 text-center" style={{ zIndex: 3 }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Open to opportunities
        </div>

        <div ref={nameRef} className="mb-4" style={{ opacity: 0 }}>
          <Parallax translateY={[-20, 20]}>
            <div className="font-black text-6xl md:text-8xl tracking-tight leading-none">
              <span className="text-shimmer">Shubham</span>
            </div>
          </Parallax>
          <Parallax translateY={[-10, 30]}>
            <div className="font-black text-6xl md:text-8xl tracking-tight leading-none">
              <span className="text-gray-500">Varshney</span>
            </div>
          </Parallax>
        </div>

        <div ref={tagRef} className="flex items-center justify-center mb-6 text-2xl md:text-3xl font-semibold" style={{ opacity: 0 }}>
          <span ref={wordRef} className="text-gray-300">{words[0]}</span>
        </div>

        <Parallax translateY={[0, 15]}>
          <p ref={descRef} className="max-w-2xl mx-auto text-base md:text-lg text-gray-500 leading-relaxed mb-10" style={{ opacity: 0 }}>
            Full-Stack Software Engineer with 2+ years crafting scalable, production-ready web applications —
            with hands-on experience shipping AI-powered products and autonomous agents.
          </p>
        </Parallax>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4" style={{ opacity: 0 }}>
          <button data-magnetic
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3.5 text-sm font-semibold text-black rounded-full bg-white hover:bg-gray-200 shadow-lg shadow-white/10 transition-colors duration-300">
            View My Work
          </button>
          <a data-magnetic href="mailto:shubh.varshneycode@gmail.com"
            className="px-8 py-3.5 text-sm font-semibold text-white rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 transition-colors duration-300">
            Get In Touch
          </a>
        </div>

        <div className="flex items-center justify-center gap-6 mt-14">
          {[{ label: 'GitHub', href: 'https://github.com/shubhamxcode', icon: 'GH' },
            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shubhamxcode/', icon: 'IN' },
            { label: 'X', href: 'https://x.com/shubhamXcode', icon: 'X' }].map(({ label, href, icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm text-gray-600 hover:text-white transition-colors duration-200">
              <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold group-hover:border-white/30 group-hover:bg-white/10 transition-all duration-200">
                {icon}
              </span>
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Rotating circular badge */}
      <div className="absolute bottom-12 right-10 hidden lg:block" style={{ zIndex: 3 }}>
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full spin-slow">
            <defs>
              <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
            </defs>
            <text fontSize="8.2" fill="rgba(255,255,255,0.45)" letterSpacing="1.8" fontFamily="Oswald, sans-serif">
              <textPath href="#badge-circle">OPEN TO WORK • FULL-STACK • AI AGENTS •</textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600" style={{ zIndex: 3 }}>
        <span className="text-xs tracking-widest uppercase font-medium">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-gray-500 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
