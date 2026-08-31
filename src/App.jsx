import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ParallaxProvider } from 'react-scroll-parallax';
import Lenis from 'lenis';
import './index.css';

import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import AmbientSound from './components/AmbientSound';

const Jungle = lazy(() => import('./components/Jungle'));

// Holds the movie's full scroll height while the three.js chunk arrives,
// with a dawn-sky title card so the first paint is never blank.
function JungleFallback() {
  return (
    <div style={{ height: '900vh' }} className="bg-gradient-to-b from-[#f6c185] via-[#bfe4f0] to-[#081310]">
      <div className="h-screen sticky top-0 flex flex-col items-center justify-center text-center px-6">
        <p className="section-label mb-3 !text-[#5f4128]">Welcome to my world</p>
        <h1 className="display text-6xl md:text-8xl text-[#243a2c] leading-none">SHUBHAM'S JUNGLE</h1>
        <p className="mt-4 text-sm text-[#5f4128]/80">Full-Stack Software Engineer · the jungle is waking up…</p>
      </div>
    </div>
  );
}

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const cursorRef    = useRef(null);
  const cursorDotRef = useRef(null);
  const progressRef  = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // Start downloading the jungle while the preloader plays
  useEffect(() => { import('./components/Jungle'); }, []);

  // Buttery smooth scrolling — Lenis drives the scroll, GSAP's ticker drives Lenis
  useEffect(() => {
    if (!loaded) return undefined;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [loaded]);

  // Scroll progress bar
  useEffect(() => {
    if (!loaded) return;
    const tween = gsap.to(progressRef.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    });
    return () => tween.scrollTrigger?.kill();
  }, [loaded]);

  // Char-split heading reveals — wraps [data-split] text once, animates on scroll
  useEffect(() => {
    if (!loaded) return;
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();

    const triggers = [];
    document.querySelectorAll('[data-split]').forEach((el) => {
      if (!el.dataset.splitDone) {
        el.dataset.splitDone = 'true';
        const wrap = (node) => {
          [...node.childNodes].forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              const frag = document.createDocumentFragment();
              child.textContent.split('').forEach((ch) => {
                const s = document.createElement('span');
                s.className = 'split-char';
                s.textContent = ch === ' ' ? ' ' : ch;
                frag.appendChild(s);
              });
              node.replaceChild(frag, child);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              wrap(child);
            }
          });
        };
        wrap(el);
      }
      const chars = el.querySelectorAll('.split-char');
      gsap.set(chars, { yPercent: 110, opacity: 0 });
      triggers.push(ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(chars, {
          yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.022, ease: 'power4.out',
        }),
      }));
    });
    return () => triggers.forEach((t) => t.kill());
  }, [loaded]);

  // Card spotlight + magnetic buttons — one delegated listener for both
  useEffect(() => {
    const onMove = (e) => {
      const card = e.target.closest?.('.glass-card');
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }
      const mag = e.target.closest?.('[data-magnetic]');
      if (mag) {
        const r = mag.getBoundingClientRect();
        gsap.to(mag, {
          x: (e.clientX - r.left - r.width / 2) * 0.35,
          y: (e.clientY - r.top - r.height / 2) * 0.35,
          duration: 0.3, ease: 'power2.out',
        });
      }
    };
    const onOut = (e) => {
      const mag = e.target.closest?.('[data-magnetic]');
      if (mag && !mag.contains(e.relatedTarget)) {
        gsap.to(mag, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseout', onOut);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  // Custom cursor — delegated hover detection so late-mounted elements work too
  useEffect(() => {
    const cursor = cursorRef.current;
    const dot    = cursorDotRef.current;

    const moveCursor = (e) => {
      gsap.set(cursor, { opacity: 1 });
      gsap.set(dot,    { opacity: 1 });
      gsap.to(dot,    { x: e.clientX, y: e.clientY, duration: 0.05, ease: 'none' });
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.4,  ease: 'power2.out' });
    };
    const isInteractive = (t) => t.closest?.('a, button, [data-magnetic]');
    const onOver = (e) => { if (isInteractive(e.target)) gsap.to(cursor, { scale: 2.4, duration: 0.3 }); };
    const onOut  = (e) => {
      if (isInteractive(e.target) && !(e.relatedTarget && isInteractive(e.relatedTarget))) {
        gsap.to(cursor, { scale: 1, duration: 0.3 });
      }
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return (
    <ParallaxProvider>
      {!loaded && <Preloader onDone={() => setLoaded(true)} />}

      {/* Film grain */}
      <div className="noise-overlay" />

      {/* Scroll progress bar */}
      <div ref={progressRef}
        className="fixed top-0 left-0 right-0 z-[10000] h-0.5 bg-gradient-to-r from-[#9fd8b7]/90 to-[#7dd3fc]/50 origin-left"
        style={{ transform: 'scaleX(0)' }} />

      {/* Custom cursor — inverts whatever it passes over */}
      <div ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-8 h-8 rounded-full border border-white opacity-0 -translate-x-1/2 -translate-y-1/2 hidden md:block mix-blend-difference"
        style={{ willChange: 'transform' }} />
      <div ref={cursorDotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-1.5 h-1.5 rounded-full bg-white opacity-0 -translate-x-1/2 -translate-y-1/2 hidden md:block mix-blend-difference"
        style={{ willChange: 'transform' }} />

      {loaded && (
        <>
          <Navbar />
          <AmbientSound />

          <main className="stack-sections">
            <Suspense fallback={<JungleFallback />}>
              <Jungle />
            </Suspense>
          </main>
        </>
      )}
    </ParallaxProvider>
  );
}
