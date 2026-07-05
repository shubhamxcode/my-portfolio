import { useEffect, useRef, useState } from 'react';

/**
 * Procedural jungle ambience — no audio files, everything synthesized live.
 * Soft wind and a distant stream flow constantly; gentle birdsong by day,
 * crickets at night, campfire crackle at the hut — all following scroll.
 *
 * Autoplay: the engine starts immediately but browsers keep audio suspended
 * until the first user gesture — we resume on the very first click, key,
 * touch, or wheel, so sound fades in the moment the visitor starts moving.
 */

const progress = () =>
  window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);

function buildEngine() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0;                      // fades in on resume
  master.connect(ctx.destination);

  const noiseBuffer = (soften) => {
    const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = b.getChannelData(0);
    let acc = 0;
    for (let i = 0; i < d.length; i++) {
      acc = (acc + soften * (Math.random() * 2 - 1)) / (1 + soften);
      d[i] = acc * 3.5;
    }
    return b;
  };

  /* wind through the canopy — slow, deep breaths */
  const wind = ctx.createBufferSource();
  wind.buffer = noiseBuffer(0.02);
  wind.loop = true;
  const windLp = ctx.createBiquadFilter();
  windLp.type = 'lowpass';
  windLp.frequency.value = 300;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.26;
  const windLfo = ctx.createOscillator();
  windLfo.frequency.value = 0.07;
  const windLfoGain = ctx.createGain();
  windLfoGain.gain.value = 0.1;
  windLfo.connect(windLfoGain).connect(windGain.gain);
  wind.connect(windLp).connect(windGain).connect(master);
  wind.start();
  windLfo.start();

  /* a distant stream — soft shimmering band of noise */
  const stream = ctx.createBufferSource();
  stream.buffer = noiseBuffer(0.3);
  stream.loop = true;
  const streamBp = ctx.createBiquadFilter();
  streamBp.type = 'bandpass';
  streamBp.frequency.value = 950;
  streamBp.Q.value = 0.6;
  const streamGain = ctx.createGain();
  streamGain.gain.value = 0.028;
  const streamLfo = ctx.createOscillator();
  streamLfo.frequency.value = 0.05;
  const streamLfoGain = ctx.createGain();
  streamLfoGain.gain.value = 0.01;
  streamLfo.connect(streamLfoGain).connect(streamGain.gain);
  stream.connect(streamBp).connect(streamGain).connect(master);
  stream.start();
  streamLfo.start();

  /* one-shot voices — all soft-edged */
  const chirp = () => {
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f0 = 1400 + Math.random() * 650;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(f0 * 0.8, t0 + 0.22);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.04, t0 + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.4);
    o.connect(g).connect(master);
    o.start(t0);
    o.stop(t0 + 0.45);
    if (Math.random() < 0.3) setTimeout(chirp, 260 + Math.random() * 200);
  };

  const cricket = (level) => {
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 3800 + Math.random() * 350;
    const pulses = 5 + Math.floor(Math.random() * 4);
    g.gain.setValueAtTime(0, t0);
    for (let i = 0; i < pulses; i++) {
      const tp = t0 + i * 0.055;
      g.gain.linearRampToValueAtTime(0.02 * level, tp + 0.015);
      g.gain.linearRampToValueAtTime(0.0, tp + 0.05);
    }
    o.connect(g).connect(master);
    o.start(t0);
    o.stop(t0 + pulses * 0.055 + 0.06);
  };

  const crackle = (level) => {
    const t0 = ctx.currentTime;
    const len = 0.03 + Math.random() * 0.05;
    const b = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource();
    src.buffer = b;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1100 + Math.random() * 1200;
    const g = ctx.createGain();
    g.gain.value = 0.06 * level;
    src.connect(bp).connect(g).connect(master);
    src.start(t0);
  };

  /* conductor — reads scroll progress, decides who plays */
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const timer = setInterval(() => {
    if (ctx.state !== 'running') return;
    const p = progress();
    const day = clamp01(1 - (p - 0.55) / 0.2);
    const night = clamp01((p - 0.82) / 0.12);
    const fire = clamp01((p - 0.93) / 0.05);
    windGain.gain.setTargetAtTime(0.2 + 0.1 * (1 - night * 0.6), ctx.currentTime, 0.6);
    if (Math.random() < 0.05 * day) chirp();
    if (night > 0.1 && Math.random() < 0.22) cricket(night);
    if (fire > 0.1 && Math.random() < 0.55) crackle(fire);
  }, 180);

  const fadeTo = (v, secs = 2.5) => master.gain.setTargetAtTime(v, ctx.currentTime, secs / 3);
  return { ctx, timer, fadeTo };
}

export default function AmbientSound() {
  const [status, setStatus] = useState('waiting'); // waiting → on → muted
  const engineRef = useRef(null);

  useEffect(() => {
    const engine = buildEngine();
    engineRef.current = engine;

    const wake = () => {
      engine.ctx.resume().then(() => {
        if (engineRef.current !== engine) return;
        engine.fadeTo(0.15, 3); // gentle fade-in
        setStatus('on');
        events.forEach((ev) => window.removeEventListener(ev, wake));
      }).catch(() => {});
    };
    const events = ['pointerdown', 'keydown', 'touchend', 'wheel'];
    if (engine.ctx.state === 'running') wake();
    else events.forEach((ev) => window.addEventListener(ev, wake, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, wake));
      clearInterval(engine.timer);
      engine.ctx.close().catch(() => {});
      engineRef.current = null;
    };
  }, []);

  const toggle = () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (status === 'on') {
      engine.fadeTo(0, 0.8);
      setStatus('muted');
    } else {
      engine.ctx.resume().then(() => engine.fadeTo(0.15, 2)).catch(() => {});
      setStatus('on');
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={status === 'on' ? 'Mute ambience' : 'Play jungle ambience'}
      className="fixed bottom-5 right-5 z-[9998] flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-colors"
      style={{
        background: 'rgba(6, 18, 12, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 233, 168, 0.3)',
        color: '#ffe9a8',
      }}>
      {status === 'on' ? (
        <>
          <span className="flex items-end gap-[2px] h-3">
            {[0.6, 1, 0.75].map((h, i) => (
              <span key={i} className="w-[3px] rounded-full bg-[#ffe9a8] animate-pulse"
                style={{ height: `${h * 100}%`, animationDelay: `${i * 0.2}s` }} />
            ))}
          </span>
          Sound on
        </>
      ) : status === 'muted' ? (
        <>🔇 Muted</>
      ) : (
        <>🔊 Sound starts with you</>
      )}
    </button>
  );
}
