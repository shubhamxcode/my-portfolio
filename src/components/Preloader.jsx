import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const NAME = 'SHUBHAM VARSHNEY';

export default function Preloader({ onDone }) {
  const rootRef  = useRef(null);
  const nameRef  = useRef(null);
  const countRef = useRef(null);
  const lineRef  = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const chars = nameRef.current.querySelectorAll('.pre-char');
    const cols  = rootRef.current.querySelectorAll('.pre-col');
    const counter = { v: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        onDone();
      },
    });

    tl.fromTo(chars, { yPercent: 120 },
        { yPercent: 0, stagger: 0.04, duration: 0.8, ease: 'power4.out', delay: 0.15 })
      .fromTo(lineRef.current, { scaleX: 0 },
        { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, '<')
      .to(counter, {
        v: 100, duration: 1.2, ease: 'power2.inOut',
        onUpdate: () => { if (countRef.current) countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0'); },
      }, '<')
      .to(chars, { yPercent: -120, stagger: 0.025, duration: 0.5, ease: 'power3.in' }, '+=0.2')
      .to([countRef.current, lineRef.current], { opacity: 0, duration: 0.3 }, '<')
      .to(cols, { scaleY: 0, transformOrigin: 'top center', stagger: 0.07, duration: 0.75, ease: 'power4.inOut' }, '-=0.15');

    return () => { tl.kill(); document.body.style.overflow = ''; };
  }, [onDone]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[10001]">
      {/* Curtain columns */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="pre-col flex-1 h-full bg-[#0a0a0a]" style={{ willChange: 'transform' }} />
        ))}
      </div>

      {/* Name */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div ref={nameRef} className="overflow-hidden py-2">
          <h1 className="display text-5xl md:text-8xl tracking-wide text-white whitespace-nowrap">
            {NAME.split('').map((c, i) => (
              <span key={i} className="pre-char inline-block" style={{ willChange: 'transform' }}>
                {c === ' ' ? ' ' : c}
              </span>
            ))}
          </h1>
        </div>
      </div>

      {/* Progress line */}
      <div ref={lineRef}
        className="absolute left-1/2 -translate-x-1/2 bottom-[22%] w-48 h-px bg-white/40 origin-left"
        style={{ transform: 'scaleX(0)' }} />

      {/* Counter */}
      <div ref={countRef}
        className="display absolute bottom-8 right-8 text-7xl md:text-9xl leading-none outline-text select-none">
        000
      </div>
    </div>
  );
}
