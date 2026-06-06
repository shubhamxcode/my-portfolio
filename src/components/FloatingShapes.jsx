import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const shapes = [
  { top: '12%',  left: '-6%',   size: 80,  type: 'circle', color: 'bg-white/3',   scrub: 3,   yMove: -500 },
  { top: '25%',  left: '102%',  size: 50,  type: 'ring',   color: 'border-white/5', scrub: 2, yMove: -700 },
  { top: '40%',  left: '-4%',   size: 30,  type: 'square', color: 'bg-white/4',   scrub: 1.5, yMove: -900 },
  { top: '55%',  left: '98%',   size: 100, type: 'circle', color: 'bg-white/3',   scrub: 2.5, yMove: -600 },
  { top: '65%',  left: '-8%',   size: 60,  type: 'ring',   color: 'border-white/5', scrub: 1.8, yMove: -800 },
  { top: '75%',  left: '105%',  size: 40,  type: 'square', color: 'bg-white/4',   scrub: 1.2, yMove: -1000 },
  { top: '85%',  left: '10%',   size: 70,  type: 'circle', color: 'bg-white/3',   scrub: 2.2, yMove: -400 },
  { top: '90%',  left: '85%',   size: 45,  type: 'ring',   color: 'border-white/5', scrub: 1.6, yMove: -750 },
];

export default function FloatingShapes() {
  const containerRef = useRef(null);

  useEffect(() => {
    const items = containerRef.current.querySelectorAll('[data-shape]');
    items.forEach((el) => {
      gsap.to(el, {
        y: parseFloat(el.dataset.ymove),
        rotation: Math.random() > 0.5 ? 180 : -180,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: parseFloat(el.dataset.scrub) },
      });
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {shapes.map((s, i) => {
        const style = { width: s.size, height: s.size, top: s.top, left: s.left };
        if (s.type === 'circle')
          return <div key={i} data-shape data-ymove={s.yMove} data-scrub={s.scrub} className={`absolute blur-sm rounded-full ${s.color}`} style={style} />;
        if (s.type === 'ring')
          return <div key={i} data-shape data-ymove={s.yMove} data-scrub={s.scrub} className={`absolute rounded-full border-4 ${s.color} bg-transparent`} style={style} />;
        return <div key={i} data-shape data-ymove={s.yMove} data-scrub={s.scrub} className={`absolute rotate-12 ${s.color}`} style={style} />;
      })}
    </div>
  );
}
