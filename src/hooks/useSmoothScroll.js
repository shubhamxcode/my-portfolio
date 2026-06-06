import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export function useSmoothScroll() {
  useEffect(() => {
    let smoother;
    try {
      smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.5,
        effects: true,
        smoothTouch: 0.1,
      });
    } catch {
      // ScrollSmoother requires GSAP Club — fall back gracefully
    }
    return () => smoother?.kill();
  }, []);
}
