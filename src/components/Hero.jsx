import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Parallax } from 'react-scroll-parallax';

gsap.registerPlugin(ScrollTrigger);

const words = ['Full-Stack Engineer', 'React Developer', 'Next.js Builder'];

const PARTICLE_COUNT = 80;
const MAX_DIST       = 140;

function initParticles(w, h) {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.5,
  }));
}

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
  const canvasRef  = useRef(null);
  const mousePos   = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx2d  = canvas.getContext('2d');
    let particles = [];
    let raf;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles = initParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener('mousemove', onMouse);

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx2d.clearRect(0, 0, w, h);

      for (const p of particles) {
        // drift toward mouse slightly
        const dx = mousePos.current.x - p.x;
        const dy = mousePos.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          p.vx += dx * 0.00015;
          p.vy += dy * 0.00015;
        }
        // dampen
        p.vx *= 0.995;
        p.vy *= 0.995;

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx2d.fillStyle = 'rgba(255,255,255,0.55)';
        ctx2d.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_DIST) {
            const alpha = (1 - d / MAX_DIST) * 0.18;
            ctx2d.beginPath();
            ctx2d.moveTo(particles[i].x, particles[i].y);
            ctx2d.lineTo(particles[j].x, particles[j].y);
            ctx2d.strokeStyle = `rgba(255,255,255,${alpha})`;
            ctx2d.lineWidth = 0.6;
            ctx2d.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

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
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
      <div ref={orb1Ref} className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div ref={orb2Ref} className="absolute bottom-1/3 -right-32 w-[450px] h-[450px] rounded-full bg-white/3 blur-3xl pointer-events-none" />
      <div ref={orb3Ref} className="absolute top-2/3 left-1/3 w-64 h-64 rounded-full bg-white/4 blur-3xl pointer-events-none" />

      <Parallax speed={-15} className="absolute inset-0 pointer-events-none">
        <div ref={gridRef} className="w-full h-full"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </Parallax>

      <div ref={contentRef} className="relative z-10 max-w-6xl mx-auto px-6 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Open to opportunities
        </div>

        <div ref={nameRef} className="mb-4">
          <Parallax translateY={[-20, 20]}>
            <div className="font-black text-6xl md:text-8xl tracking-tight leading-none">
              <span className="text-white">Shubham</span>
            </div>
          </Parallax>
          <Parallax translateY={[-10, 30]}>
            <div className="font-black text-6xl md:text-8xl tracking-tight leading-none">
              <span className="text-gray-500">Varshney</span>
            </div>
          </Parallax>
        </div>

        <div ref={tagRef} className="flex items-center justify-center mb-6 text-2xl md:text-3xl font-semibold">
          <span ref={wordRef} className="text-gray-300">{words[0]}</span>
        </div>

        <Parallax translateY={[0, 15]}>
          <p ref={descRef} className="max-w-2xl mx-auto text-base md:text-lg text-gray-500 leading-relaxed mb-10">
            Full-Stack Software Engineer with 2+ years crafting scalable, production-ready web applications.
            Passionate about performance, clean APIs, and pixel-perfect UIs.
          </p>
        </Parallax>

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

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
        <span className="text-xs tracking-widest uppercase font-medium">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-gray-500 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
