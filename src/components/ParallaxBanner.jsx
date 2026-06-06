import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const items = ['React', '·', 'Next.js', '·', 'TypeScript', '·', 'Node.js', '·', 'PostgreSQL', '·',
  'Docker', '·', 'AWS', '·', 'GraphQL', '·', 'WebSockets', '·', 'Tailwind CSS', '·'];
const doubled = [...items, ...items, ...items, ...items];

export default function ParallaxBanner() {
  const sectionRef = useRef(null);
  const track1Ref  = useRef(null);
  const track2Ref  = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(track1Ref.current, { xPercent: -50, repeat: -1, duration: 22, ease: 'none' });
      gsap.to(track2Ref.current, { xPercent: 50,  repeat: -1, duration: 28, ease: 'none' });
      gsap.to(wrapperRef.current, { y: -40, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-14 bg-white/5 border-y border-white/5 overflow-hidden">
      <div ref={wrapperRef}>
        <div className="relative overflow-hidden mb-3">
          <div ref={track1Ref} className="flex gap-10 whitespace-nowrap">
            {doubled.map((item, i) => (
              <span key={i} className={`text-sm font-semibold ${item === '·' ? 'text-white/10' : 'text-white/30'}`}>{item}</span>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden">
          <div ref={track2Ref} className="flex gap-10 whitespace-nowrap" style={{ transform: 'translateX(-50%)' }}>
            {doubled.map((item, i) => (
              <span key={i} className={`text-sm font-semibold ${item === '·' ? 'text-white/10' : 'text-white/20'}`}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
