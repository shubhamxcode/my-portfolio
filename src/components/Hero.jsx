import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const words = ['Full-Stack Engineer', 'React Developer', 'TypeScript Expert', 'Next.js Builder'];

export default function Hero() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.3 });
      tl.fromTo(nameRef.current, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2 })
        .fromTo(tagRef.current,  { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.7')
        .fromTo(descRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
        .fromTo(ctaRef.current,  { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4');

      gsap.to(contentRef.current, { y: -180, scale: 0.92, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1 } });
      gsap.to(orb1Ref.current, { y: -60, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 2.5 } });
      gsap.to(orb2Ref.current, { y: -120, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1.8 } });
      gsap.to(orb3Ref.current, { y: -200, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1.0 } });
      gsap.to(gridRef.current, { y: -50, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: '70% top', scrub: 1 } });

      gsap.to(orb1Ref.current, { y: '+=22', duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to(orb2Ref.current, { y: '+=16', duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });
    }, sectionRef);

    const interval = setInterval(() => {
      wordIndex.current = (wordIndex.current + 1) % words.length;
      gsap.to(wordRef.current, {
        y: -20, opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          if (wordRef.current) wordRef.current.textContent = words[wordIndex.current];
          gsap.fromTo(wordRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
        },
      });
    }, 2500);

    const onMouse = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      gsap.to(orb1Ref.current, { x: x * 0.5, duration: 1.5, ease: 'power2.out', overwrite: false });
      gsap.to(orb2Ref.current, { x: -x * 0.4, duration: 2,  ease: 'power2.out', overwrite: false });
      gsap.to(orb3Ref.current, { x: x * 0.9,  duration: 1,  ease: 'power2.out', overwrite: false });
    };
    window.addEventListener('mousemove', onMouse);
    return () => { clearInterval(interval); window.removeEventListener('mousemove', onMouse); };
  }, []);

  return (
    <section ref={sectionRef} id="hero" className="panel relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]" style={{ zIndex: 1 }}>
      <div ref={orb1Ref} className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div ref={orb2Ref} className="absolute bottom-1/3 -right-32 w-[450px] h-[450px] rounded-full bg-white/3 blur-3xl pointer-events-none" />
      <div ref={orb3Ref} className="absolute top-2/3 left-1/3 w-64 h-64 rounded-full bg-white/4 blur-3xl pointer-events-none" />

      <div ref={gridRef} className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div ref={contentRef} className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Open to opportunities
        </div>

        <h1 ref={nameRef} className="font-black text-6xl md:text-8xl tracking-tight leading-none mb-4">
          <span className="text-white">Shubham</span><br />
          <span className="text-gray-500">Varshney</span>
        </h1>

        <div ref={tagRef} className="flex items-center justify-center mb-6 text-2xl md:text-3xl font-semibold">
          <span ref={wordRef} className="text-gray-300">{words[0]}</span>
        </div>

        <p ref={descRef} className="max-w-2xl mx-auto text-base md:text-lg text-gray-500 leading-relaxed mb-10">
          Full-Stack Software Engineer with 2+ years crafting scalable, production-ready web applications.
          Passionate about performance, clean APIs, and pixel-perfect UIs.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-3.5 text-sm font-semibold text-black rounded-full bg-white hover:bg-gray-200 shadow-lg shadow-white/10 transition-all duration-300 hover:-translate-y-0.5">
            View My Work
          </button>
          <a href="mailto:shubh.varshneycode@gmail.com"
            className="px-8 py-3.5 text-sm font-semibold text-white rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all duration-300">
            Get In Touch
          </a>
        </div>

        <div className="flex items-center justify-center gap-6 mt-14">
          {[{ label: 'GitHub', href: 'https://github.com', icon: 'GH' },
            { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'IN' },
            { label: 'Twitter', href: 'https://twitter.com', icon: 'TW' }].map(({ label, href, icon }) => (
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

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
        <span className="text-xs tracking-widest uppercase font-medium">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-gray-500 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
