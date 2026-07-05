import { useMemo } from 'react';

/** Layered mountain silhouette — two variants so stacked ridges read as depth. */
export function Ridge({ fill = '#07120e', variant = 1, className = '' }) {
  const d = variant === 1
    ? 'M0,120 L90,70 L200,130 L330,50 L470,120 L610,35 L760,110 L900,55 L1050,125 L1180,80 L1300,130 L1440,90 L1440,200 L0,200 Z'
    : 'M0,150 L140,110 L300,155 L480,95 L660,150 L840,105 L1020,155 L1200,120 L1360,160 L1440,140 L1440,200 L0,200 Z';
  return (
    <svg viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true"
      className={`pointer-events-none w-full ${className}`}>
      <path d={d} fill={fill} />
    </svg>
  );
}

/** Warm blinking fireflies drifting inside the parent (parent must be relative + overflow-hidden). */
export function Fireflies({ count = 10, className = '' }) {
  const flies = useMemo(() =>
    Array.from({ length: count }, () => ({
      left: `${(Math.random() * 96 + 2).toFixed(1)}%`,
      top: `${(Math.random() * 88 + 6).toFixed(1)}%`,
      dur: `${(7 + Math.random() * 8).toFixed(1)}s`,
      blink: `${(2.2 + Math.random() * 3).toFixed(1)}s`,
      delay: `${(Math.random() * -12).toFixed(1)}s`,
      dx: `${(Math.random() * 70 - 35).toFixed(0)}px`,
      dy: `${(Math.random() * -70 - 10).toFixed(0)}px`,
      scale: (0.6 + Math.random() * 1.2).toFixed(2),
    })), [count]);

  return (
    <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${className}`}>
      {flies.map((f, i) => (
        <span key={i} className="firefly"
          style={{
            left: f.left, top: f.top,
            '--dur': f.dur, '--blink': f.blink, '--dx': f.dx, '--dy': f.dy,
            animationDelay: `${f.delay}, ${f.delay}`,
            transform: `scale(${f.scale})`,
          }} />
      ))}
    </div>
  );
}

/** Soft drifting fog band. Position/size via className (e.g. "bottom-10 -left-20 w-[60vw] h-40"). */
export function Mist({ className = '', dur = '26s' }) {
  return <div aria-hidden="true" className={`mist ${className}`} style={{ '--dur': dur }} />;
}

/** Aurora ribbon. Position/size via className. */
export function Aurora({ className = '', delay = '0s' }) {
  return <div aria-hidden="true" className={`aurora ${className}`} style={{ animationDelay: delay }} />;
}
