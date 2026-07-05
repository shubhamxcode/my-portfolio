import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Giant two-row marquee. Rows drift in opposite directions and the whole
 * band skews with scroll velocity — the faster you scroll, the more it leans.
 */
export default function BigMarquee({ top = 'FULL-STACK ENGINEER', bottom = 'AI BUILDER', zIndex = 2 }) {
  const sectionRef = useRef(null);
  const row1Ref    = useRef(null);
  const row2Ref    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(row1Ref.current, { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
      gsap.fromTo(row2Ref.current, { xPercent: -50 }, { xPercent: 0, duration: 46, ease: 'none', repeat: -1 });

      const rows = [row1Ref.current, row2Ref.current];
      const proxy = { skew: 0 };
      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const target = gsap.utils.clamp(-10, 10, self.getVelocity() / -300);
          gsap.to(proxy, {
            skew: target, duration: 0.5, ease: 'power2.out', overwrite: true,
            onUpdate: () => rows.forEach((r) => gsap.set(r, { skewX: proxy.skew })),
          });
        },
      });
      return () => st.kill();
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const repeat = Array.from({ length: 6 });

  return (
    <section ref={sectionRef}
      className="panel relative py-12 md:py-16 bg-[#0a1712] overflow-hidden border-y border-white/5"
      style={{ zIndex }}>
      <div ref={row1Ref} className="flex w-max whitespace-nowrap will-change-transform">
        {repeat.map((_, i) => (
          <span key={i} className="display text-[13vw] md:text-[9vw] leading-none outline-text pr-8">
            {top} <span className="text-white/20">✦</span>&nbsp;
          </span>
        ))}
      </div>
      <div ref={row2Ref} className="flex w-max whitespace-nowrap will-change-transform mt-1 md:mt-2">
        {repeat.map((_, i) => (
          <span key={i} className="display text-[13vw] md:text-[9vw] leading-none text-white/10 pr-8">
            {bottom} <span className="text-white/5">✦</span>&nbsp;
          </span>
        ))}
      </div>
    </section>
  );
}
