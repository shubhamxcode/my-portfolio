import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const NAME = 'SHUBHAM VARSHNEY';

export default function Preloader({ onDone }) {
  const rootRef  = useRef(null);
  const nameRef  = useRef(null);
  const countRef = useRef(null);
  const lineRef  = useRef(null);

  useEffect(() => {
    // Hidden tab (opened in background)? Don't make anyone wait — show the site instantly.
    if (document.hidden) {
      onDone();
      return undefined;
    }

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
        { yPercent: 0, stagger: 0.028, duration: 0.55, ease: 'power4.out', delay: 0.05 })
      .fromTo(lineRef.current, { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, '<')
      .to(counter, {
        v: 100, duration: 0.8, ease: 'power2.inOut',
        onUpdate: () => { if (countRef.current) countRef.current.textContent = String(Math.round(counter.v)).padStart(3, '0'); },
      }, '<')
      .to(chars, { yPercent: -120, stagger: 0.015, duration: 0.35, ease: 'power3.in' }, '+=0.1')
      .to([countRef.current, lineRef.current], { opacity: 0, duration: 0.25 }, '<')
      .to(cols, { scaleY: 0, transformOrigin: 'top center', stagger: 0.05, duration: 0.55, ease: 'power4.inOut' }, '-=0.1');

    // Tab hidden mid-animation → jump straight to the end instead of crawling at 2fps.
    const onVisibility = () => { if (document.hidden) tl.progress(1); };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      tl.kill();
      document.body.style.overflow = '';
    };
  }, [onDone]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-[10001]">
      {/* Curtain columns */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="pre-col flex-1 h-full bg-[#081310]" style={{ willChange: 'transform' }} />
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
        className="absolute left-1/2 -translate-x-1/2 bottom-[22%] w-48 h-px bg-[#9fd8b7]/50 origin-left"
        style={{ transform: 'scaleX(0)' }} />

      {/* Counter */}
      <div ref={countRef}
        className="display absolute bottom-8 right-8 text-7xl md:text-9xl leading-none outline-text select-none">
        000
      </div>
    </div>
  );
}
