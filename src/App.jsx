import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ParallaxProvider } from 'react-scroll-parallax';
import './index.css';


import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FloatingShapes from './components/FloatingShapes';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const cursorRef    = useRef(null);
  const cursorDotRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot    = cursorDotRef.current;

    const moveCursor = (e) => {
      gsap.set(cursor, { opacity: 0.5 });
      gsap.set(dot,    { opacity: 1 });
      gsap.to(dot,    { x: e.clientX, y: e.clientY, duration: 0.05, ease: 'none' });
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.4,  ease: 'power2.out' });
    };
    const grow   = () => gsap.to(cursor, { scale: 2.5, opacity: 0.3, duration: 0.3 });
    const shrink = () => gsap.to(cursor, { scale: 1,   opacity: 0.5, duration: 0.3 });

    window.addEventListener('mousemove', moveCursor);
    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <ParallaxProvider>
      {/* Custom cursor — monochrome */}
      <div ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-8 h-8 rounded-full border-2 border-gray-800 opacity-0 -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ willChange: 'transform' }} />
      <div ref={cursorDotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-1.5 h-1.5 rounded-full bg-black opacity-0 -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ willChange: 'transform' }} />

      <Navbar />
      <FloatingShapes />

      <main className="stack-sections">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
        <Footer />
      </main>
    </ParallaxProvider>
  );
}
