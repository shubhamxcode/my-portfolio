import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * SHUBHAM'S JUNGLE — a scroll-driven 3D movie.
 *
 * The journey: dawn aerial → the animals of the stack (skills) → the Career
 * Stones (experience) → the Empire, four monuments each housing one project →
 * home at dusk. One canvas; ScrollTrigger owns the camera; rendering pauses
 * off screen.
 */

const SECTION_VH = 1500; // scroll length of the movie

/* ── deterministic pseudo-noise for terrain & scatter ── */
const n2 = (x, z) =>
  Math.sin(x * 0.16) * Math.cos(z * 0.13) * 1.4 +
  Math.sin(x * 0.045 + 1.7) * Math.cos(z * 0.06 + 4.2) * 3.2 +
  Math.sin(x * 0.4 + z * 0.33) * 0.35;

const rand = (() => { let s = 42; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

/* ── world landmarks ── */
const HILL = { x: 0, z: -125, r: 24 };   // empire plateau
const HOME = { x: 0, z: -145 };          // the hut

/* ── sky / light keyframes: dawn → day → sunset → dusk ── */
const SKY = [
  { p: 0.00, sky: '#f6c185', fog: '#eeb887', sun: '#ffdca8', sunI: 1.25, hemiI: 0.95 },
  { p: 0.20, sky: '#bfe4f0', fog: '#cdeada', sun: '#fff4d8', sunI: 1.45, hemiI: 1.15 },
  { p: 0.50, sky: '#a5d7e6', fog: '#b7e0c8', sun: '#ffffff', sunI: 1.50, hemiI: 1.20 },
  { p: 0.66, sky: '#e8c07a', fog: '#dcb277', sun: '#ffd9a0', sunI: 1.25, hemiI: 0.95 },
  { p: 0.80, sky: '#f0a267', fog: '#e0935e', sun: '#ff9c50', sunI: 1.00, hemiI: 0.78 },
  { p: 0.92, sky: '#2d3f68', fog: '#253354', sun: '#8090ca', sunI: 0.50, hemiI: 0.52 },
  { p: 1.00, sky: '#131c36', fog: '#0f172e', sun: '#4a5a94', sunI: 0.35, hemiI: 0.42 },
];

/* ── camera keyframes: [progress, camPos, lookAt] ── */
const CAM = [
  [0.000, [0, 30, 40],      [0, 0, -30]],
  [0.060, [0, 5, 16],       [0, 2, -12]],
  [0.105, [7, 2.6, 1],      [3, 0.8, -6]],     // fox
  [0.175, [-8, 2.8, -15],   [-4, 1.0, -22]],   // tiger
  [0.245, [7.5, 2.4, -31],  [3.5, 0.5, -38]],  // serpent
  [0.315, [-9, 3.4, -46],   [-5, 1.8, -54]],   // elephant
  [0.385, [8, 4.2, -63],    [4, 4.0, -70]],    // owl
  [0.442, [0, 7, -66],      [0, 1, -95]],      // experience — wide shot down the trail of years
  [0.496, [-1, 2.4, -73],   [4, 2.2, -80]],    // AshnaAI career stone
  [0.554, [1, 2.8, -84],    [-4, 3.0, -91]],   // AdsFlicker career stone
  [0.612, [-1, 2.6, -95],   [4, 3.2, -102]],   // RedCircle career stone
  [0.664, [0, 11, -108],    [0, 8, -125]],     // empire wide shot
  [0.712, [-0.5, 6, -118],  [-3, 6.5, -127]],  // PaperX exchange
  [0.767, [5.5, 6.5, -118], [3, 6.5, -127]],   // Notifyr watchtower
  [0.822, [5.5, 6, -112],   [9, 7, -121]],     // ReviewIQ review spire
  [0.877, [-5.5, 6.5, -112],[-9, 7, -121]],    // Souji observatory
  [0.945, [4.5, 3.6, -133], [0, 2, -145]],     // home exterior
  [0.962, [0, 1.7, -137.5], [0, 1.8, -145]],   // walking to the door
  [0.974, [0, 1.7, -142.0], [0.6, 1.5, -146.2]], // through the door
  [1.000, [-1.0, 1.9, -143.2], [0.9, 1.2, -146.4]], // inside — me at the desk
];

/* ── the story: html overlay chapters [start, end] ── */
const CHAPTERS = [
  {
    range: [-0.05, 0.055], hint: true, // starts below 0 so it's fully visible on load
    label: 'Welcome to my world', title: "SHUBHAM'S JUNGLE",
    body: 'Full-Stack Software Engineer · 2.5+ years building production-ready web apps and AI-powered products. Meet the animals of my stack, walk the Career Stones, visit the four monuments I built, then find me at the hut.',
  },
  {
    range: [0.075, 0.135],
    label: 'Species 01 · The React Fox', title: 'FRONTEND',
    plain: 'I build fast, beautiful interfaces that users love.',
    stack: ['React', 'Next.js', 'Redux · RTK Query', 'TanStack Query', 'Tailwind CSS'],
    level: '2.5+ years in production',
  },
  {
    range: [0.145, 0.205],
    label: 'Species 02 · The Type Tiger', title: 'LANGUAGES',
    plain: 'I write strictly typed code that survives production.',
    stack: ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Swift'],
    level: 'TypeScript-first, end to end',
  },
  {
    range: [0.215, 0.275],
    label: 'Species 03 · The Python Serpent', title: 'AI ENGINEERING',
    plain: 'I ship AI products — autonomous agents, vision, and voice.',
    stack: ['LLM Integration (Gemini)', 'AI Agents', 'Browser Automation', 'Vision AI', 'Whisper STT', 'Vector Embeddings'],
    level: 'AI across products and workflows',
  },
  {
    range: [0.285, 0.345],
    label: 'Species 04 · The Postgres Elephant', title: 'DATABASES',
    plain: 'I design data layers that never forget a single row.',
    stack: ['PostgreSQL', 'MongoDB', 'Redis', 'Supabase', 'SQLite'],
    level: 'Modeled, indexed & scaled in production',
  },
  {
    range: [0.355, 0.415],
    label: 'Species 05 · The Node Owl', title: 'BACKEND & CLOUD',
    plain: 'I build APIs that serve thousands of requests without blocking.',
    stack: ['Node.js', 'Express', 'REST APIs', 'GraphQL', 'WebSockets', 'AWS', 'Docker', 'GitHub Actions'],
    level: 'Event-driven · real-time · deployed',
  },
  {
    range: [0.425, 0.462],
    label: 'The trail of years · 2024 → 2026', title: 'EXPERIENCE',
    body: 'Three companies where I shipped production features end to end, from the interface down to the database.',
    stack: ['3 Companies', '2.5+ Years', 'Production Experience'],
  },
  {
    range: [0.472, 0.520],
    label: 'Experience 01 / 03 · The 2024 stone', title: 'FULL STACK INTERN',
    company: 'AshnaAI', period: 'Dec 2024 – May 2025 · Internship · Remote',
    points: [
      'Developed AshnaAI\'s platform using Next.js, TypeScript, and Tailwind CSS, focusing on performance and responsive UI.',
      'Built reusable UI components and integrated RESTful APIs for scalable application workflows.',
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'RESTful APIs'],
    link: { href: 'https://www.ashna.ai', label: 'Visit AshnaAI ↗' },
  },
  {
    range: [0.530, 0.578],
    label: 'Experience 02 / 03 · The 2025 stone', title: 'FULL STACK ENGINEER',
    company: 'AdsFlicker', period: 'Jun 2024 – Jun 2025 · Full-time · Remote',
    points: [
      'Developed core features for AdsFlicker\'s advertising platform for advertisers and publishers.',
      'Built campaign management, tracking, and reporting modules supporting CPA, CPC, and CPM ad models.',
      'Integrated AI-powered campaign insights with automated ad copy suggestions and performance summaries.',
    ],
    stack: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    link: { href: 'https://adsflicker.com', label: 'Visit AdsFlicker ↗' },
  },
  {
    range: [0.588, 0.636],
    label: 'Experience 03 / 03 · The 2026 stone', title: 'FULL STACK ENGINEER',
    company: 'RedCircle', period: 'Jul 2025 – Jul 2026 · Full-time · Remote',
    points: [
      'Built a full-stack platform that converts Reddit and X posts into tradable SPL tokens on Solana.',
      'Developed the platform using React, Next.js, Node.js, Express, PostgreSQL, and Solana, including token creation and trading workflows.',
      'Built scalable APIs and database workflows for social content, token metadata, users, and blockchain interactions.',
    ],
    stack: ['React', 'Next.js', 'Node.js', 'Express', 'PostgreSQL', 'Solana'],
    link: { href: 'https://www.redcircle.lol/home', label: 'Visit RedCircle ↗' },
  },
  {
    range: [0.648, 0.680],
    label: 'What I built', title: 'MY EMPIRE',
    body: 'Four monuments, each one a product built from scratch. The camera will take you to every door.',
  },
  {
    range: [0.688, 0.735],
    label: 'Monument I · The Exchange', title: 'PAPERX',
    plain: 'Risk-free paper trading for Indian markets.',
    points: [
      'Built a paper trading platform with ₹10L virtual capital, real-time NSE/BSE data, and live TradingView charts.',
      'Added an AI trading mentor that reviews virtual trades and explains market movements in plain language.',
    ],
    stack: ['Next.js', 'TypeScript', 'Upstox API', 'PostgreSQL', 'Drizzle ORM'],
    links: [
      { href: 'https://www.paperx.xyz', label: 'Live ↗', primary: true },
      { href: 'https://github.com/shubhamxcode/paperx', label: 'GitHub ↗' },
    ],
  },
  {
    range: [0.743, 0.790],
    label: 'Monument II · The Watchtower', title: 'NOTIFYRR',
    plain: 'AI-powered monitoring for any webpage.',
    points: [
      'Building an AI-powered website monitoring platform that tracks webpages and notifies users about price drops, ticket availability, and new jobs.',
      'Uses Playwright and Gemini AI to understand webpages and user-defined goals and detect relevant changes automatically.',
    ],
    stack: ['Next.js', 'TypeScript', 'Playwright', 'Gemini', 'PostgreSQL'],
    links: [
      { href: 'https://www.notifyr.xyz', label: 'Live ↗', primary: true },
      { href: 'https://github.com/shubhamxcode/Notifyrr', label: 'GitHub ↗' },
    ],
  },
  {
    range: [0.798, 0.845],
    label: 'Monument III · The Review Spire', title: 'REVIEWIQ',
    plain: 'AI-powered code review for GitHub pull requests.',
    points: [
      'Built an AI platform for GitHub Pull Request analysis with code insights, refactoring suggestions, and issue detection.',
      'Implemented webhook-driven analysis with vector embeddings for context-aware PR reviews.',
    ],
    stack: ['React', 'TypeScript', 'TanStack Router', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'AI API'],
    links: [
      { href: 'https://www.reviewiq.xyz', label: 'Live ↗', primary: true },
      { href: 'https://github.com/shubhamxcode/ReviewIQ', label: 'GitHub ↗' },
    ],
  },
  {
    range: [0.853, 0.900],
    label: 'Monument IV · The Observatory', title: 'SOUJI',
    plain: 'A Siri-style AI assistant for macOS — voice, vision, and automation.',
    points: [
      'Built a Siri-style AI assistant for macOS with voice control, screen vision, LLM reasoning, and Mac automation.',
      'Shipped an autonomous job application agent that matches jobs to résumés, generates answers, and automates applications.',
    ],
    stack: ['Swift', 'Python', 'Chrome Extension (MV3)', 'Gemini API', 'Whisper'],
    links: [
      { href: 'https://souji-web.vercel.app', label: 'Live ↗', primary: true },
      { href: 'https://github.com/SoujiAI/Souji', label: 'GitHub ↗' },
    ],
  },
  {
    range: [0.928, 0.960],
    label: 'The hut at the edge of the jungle', title: 'WHERE I LIVE',
    body: 'The fireflies are my AI agents — they work while I sleep. Scroll — the door is open.',
  },
  {
    range: [0.976, 1.05], cta: true, // extends past 1 so the finale never fades out
    label: 'Inside the hut · 2 AM', title: 'STILL SHIPPING',
    body: 'This is me — probably coding right now. The lamp is on, the agents are running, and there\'s room on the desk for your project.',
  },
];

/* ═══════════════ builders ═══════════════ */

function flatMat(color, extra = {}) {
  return new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra });
}

function buildTerrain(disposables) {
  const geo = new THREE.PlaneGeometry(240, 320, 96, 120);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, -30); // z spans [-190, 130]
  const pos = geo.attributes.position;
  const colors = [];
  const c1 = new THREE.Color('#2e6b3f'), c2 = new THREE.Color('#5da963'), c3 = new THREE.Color('#8ec978');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const trail = THREE.MathUtils.smoothstep(Math.abs(x), 5, 16); // keep the walking trail low
    let y = Math.max(0, n2(x, z)) * trail;
    const dHill = Math.hypot(x - HILL.x, z - HILL.z);
    if (dHill < HILL.r) y += (1 - THREE.MathUtils.smoothstep(dHill, 8, HILL.r)) * 5;
    pos.setY(i, y);
    const t = Math.min(1, y / 4.5);
    const c = t < 0.5 ? c1.clone().lerp(c2, t * 2) : c2.clone().lerp(c3, (t - 0.5) * 2);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  disposables.push(geo, mat);
  return new THREE.Mesh(geo, mat);
}

function buildTrees(disposables) {
  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.26, 1.6, 5);
  const canopyGeo = new THREE.IcosahedronGeometry(1.15, 0);
  const trunkMat = flatMat('#6b4a33');
  const canopyMat = new THREE.MeshLambertMaterial({ flatShading: true, color: '#ffffff' });
  disposables.push(trunkGeo, canopyGeo, trunkMat, canopyMat);

  const N = 260;
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, N);
  const canopies = new THREE.InstancedMesh(canopyGeo, canopyMat, N);
  const dummy = new THREE.Object3D();
  const greens = ['#3f8a4d', '#57a45c', '#2f7a44', '#6fb56a', '#48945a'];
  let placed = 0, guard = 0;
  while (placed < N && guard++ < 6000) {
    const x = (rand() - 0.5) * 190;
    const z = 40 - rand() * 225;
    if (Math.abs(x) < 8 && z > -112) continue;                          // the trail
    if (Math.abs(x) < 12 && z < -74 && z > -110) continue;              // career stones clearing
    if (Math.hypot(x - HILL.x, z - HILL.z) < HILL.r + 3) continue;      // empire hill
    if (Math.hypot(x - HOME.x, z - HOME.z) < 11) continue;              // home clearing
    const s = 0.8 + rand() * 1.9;
    const y = Math.max(0, n2(x, z)) * THREE.MathUtils.smoothstep(Math.abs(x), 5, 16);
    dummy.position.set(x, y + 0.8 * s, z);
    dummy.scale.setScalar(s);
    dummy.rotation.y = rand() * Math.PI;
    dummy.updateMatrix();
    trunks.setMatrixAt(placed, dummy.matrix);
    dummy.position.y = y + (1.6 + 0.7) * s;
    dummy.updateMatrix();
    canopies.setMatrixAt(placed, dummy.matrix);
    canopies.setColorAt(placed, new THREE.Color(greens[placed % greens.length]));
    placed++;
  }
  trunks.count = canopies.count = placed;
  return [trunks, canopies];
}

/** Generic four-legged walker built from primitives. Returns { group, update }. */
function buildQuadruped({ body, head, legs, tail, ears, trunk, scale = 1, anchor, radius = 2.6, speed = 0.5, colorBody, colorHead, colorLeg }) {
  const g = new THREE.Group();
  const mats = [flatMat(colorBody), flatMat(colorHead), flatMat(colorLeg)];
  const geos = [];
  const mk = (geo, mat) => { geos.push(geo); const m = new THREE.Mesh(geo, mat); g.add(m); return m; };

  const bodyM = mk(new THREE.BoxGeometry(body[0], body[1], body[2]), mats[0]);
  bodyM.position.y = legs[1] + body[1] / 2 - 0.05;

  const headM = mk(new THREE.BoxGeometry(head, head, head), mats[1]);
  headM.position.set(0, bodyM.position.y + body[1] / 2 + head * 0.25, body[2] / 2 + head * 0.35);

  if (ears) [-1, 1].forEach((s) => {
    const e = mk(new THREE.ConeGeometry(head * 0.18, head * 0.42, 4), mats[1]);
    e.position.set(s * head * 0.28, headM.position.y + head * 0.62, headM.position.z);
  });

  const eyeGeo = new THREE.SphereGeometry(head * 0.09, 8, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x14100c });
  geos.push(eyeGeo);
  [-1, 1].forEach((s) => {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(s * head * 0.22, headM.position.y + head * 0.1, headM.position.z + head * 0.5);
    g.add(eye);
  });

  const legMeshes = [];
  const legGeo = new THREE.CylinderGeometry(legs[0], legs[0] * 0.8, legs[1], 5);
  legGeo.translate(0, -legs[1] / 2, 0);
  geos.push(legGeo);
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sz], i) => {
    const leg = new THREE.Mesh(legGeo, mats[2]);
    leg.position.set(sx * (body[0] / 2 - legs[0]), legs[1], sz * (body[2] / 2 - legs[0] * 1.4));
    leg.userData.phase = (i % 2 === 0 ? 0 : Math.PI) + (i > 1 ? Math.PI / 2 : 0);
    g.add(leg);
    legMeshes.push(leg);
  });

  let tailM = null;
  if (tail) {
    tailM = mk(new THREE.ConeGeometry(tail[0], tail[1], 5), mats[0]);
    tailM.position.set(0, bodyM.position.y + body[1] * 0.25, -body[2] / 2 - tail[1] * 0.3);
    tailM.rotation.x = Math.PI / 2.6;
  }

  const trunkParts = [];
  if (trunk) {
    const py = headM.position.y - head * 0.2, pz = headM.position.z + head * 0.45;
    for (let i = 0; i < 4; i++) {
      const seg = mk(new THREE.CylinderGeometry(trunk * (1 - i * 0.16), trunk * (1 - (i + 1) * 0.16), 0.5, 6), mats[1]);
      seg.position.set(0, py - i * 0.42, pz + i * 0.1);
      trunkParts.push(seg);
    }
  }

  g.scale.setScalar(scale);
  const update = (t) => {
    const a = t * speed;
    g.position.set(anchor[0] + Math.sin(a) * radius, anchor[1] + Math.abs(Math.sin(t * 5 * Math.max(speed, 0.35))) * 0.05 * scale, anchor[2] + Math.cos(a) * radius);
    g.rotation.y = a + Math.PI / 2;
    legMeshes.forEach((leg) => { leg.rotation.x = Math.sin(t * 5 * Math.max(speed, 0.35) + leg.userData.phase) * 0.55; });
    if (tailM) tailM.rotation.z = Math.sin(t * 3) * 0.3;
    trunkParts.forEach((seg, i) => { seg.position.x = Math.sin(t * 1.6 + i * 0.6) * 0.12 * (i + 1); });
  };
  return { group: g, update, disposables: [...geos, ...mats, eyeMat] };
}

function buildSerpent({ anchor }) {
  const g = new THREE.Group();
  const mat = flatMat('#4f9d45');
  const headMat = flatMat('#3d7d38');
  const segGeo = new THREE.SphereGeometry(0.26, 8, 8);
  const segs = [];
  for (let i = 0; i < 11; i++) {
    const m = new THREE.Mesh(segGeo, i === 0 ? headMat : mat);
    m.scale.setScalar(i === 0 ? 1.25 : 1 - i * 0.055);
    g.add(m);
    segs.push(m);
  }
  const eyeGeo = new THREE.SphereGeometry(0.055, 6, 6);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x14100c });
  const eyes = [-1, 1].map((s) => { const e = new THREE.Mesh(eyeGeo, eyeMat); g.add(e); return { e, s }; });
  const update = (t) => {
    for (let i = 0; i < segs.length; i++) {
      const u = t * 0.9 - i * 0.28;
      segs[i].position.set(anchor[0] + Math.sin(u) * 1.9 + Math.sin(t * 0.3) * 0.6, 0.24, anchor[2] + Math.cos(u * 0.8) * 1.4 - i * 0.22);
    }
    eyes.forEach(({ e, s }) => e.position.set(segs[0].position.x + s * 0.14, segs[0].position.y + 0.18, segs[0].position.z + 0.2));
  };
  return { group: g, update, disposables: [segGeo, eyeGeo, mat, headMat, eyeMat] };
}

function buildOwl({ anchor }) {
  const g = new THREE.Group();
  const bodyMat = flatMat('#7a5c40');
  const geos = [];
  const mk = (geo, mat) => { geos.push(geo); const m = new THREE.Mesh(geo, mat); g.add(m); return m; };

  const trunk = mk(new THREE.CylinderGeometry(0.35, 0.5, 6.5, 6), flatMat('#6b4a33'));
  trunk.position.set(0, 3.25, 0);
  const canopy = mk(new THREE.IcosahedronGeometry(2.4, 0), flatMat('#3f8a4d'));
  canopy.position.set(0, 7.6, 0);
  const branch = mk(new THREE.CylinderGeometry(0.09, 0.12, 1.8, 5), flatMat('#6b4a33'));
  branch.rotation.z = Math.PI / 2;
  branch.position.set(-0.9, 4.1, 0.4);

  const owl = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 10), bodyMat); geos.push(body.geometry);
  body.scale.y = 1.25;
  const headG = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), bodyMat); geos.push(head.geometry);
  headG.position.y = 0.72;
  headG.add(head);
  const eyeGeo = new THREE.CircleGeometry(0.11, 10);
  const pupilGeo = new THREE.CircleGeometry(0.05, 8);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf3e9c8 });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x191410 });
  geos.push(eyeGeo, pupilGeo);
  [-1, 1].forEach((s) => {
    const e = new THREE.Mesh(eyeGeo, eyeMat); e.position.set(s * 0.13, 0.05, 0.29); headG.add(e);
    const p = new THREE.Mesh(pupilGeo, pupilMat); p.position.set(s * 0.13, 0.05, 0.3); headG.add(p);
  });
  const wingGeo = new THREE.SphereGeometry(0.3, 8, 8);
  geos.push(wingGeo);
  const wings = [-1, 1].map((s) => {
    const w = new THREE.Mesh(wingGeo, bodyMat);
    w.scale.set(0.35, 1.0, 0.6);
    w.position.set(s * 0.42, 0.05, -0.05);
    owl.add(w);
    return { w, s };
  });
  owl.add(body, headG);
  owl.position.set(-0.9, 4.62, 0.4);
  g.add(owl);
  g.position.set(anchor[0], anchor[1], anchor[2]);

  const update = (t) => {
    headG.rotation.y = Math.sin(t * 0.55) * 0.85;
    const flap = Math.max(0, Math.sin(t * 0.4) - 0.86) * 7;
    wings.forEach(({ w, s }) => { w.rotation.z = s * (0.15 + Math.sin(t * 9) * 0.5 * flap); });
    owl.position.y = 4.62 + Math.sin(t * 1.4) * 0.03;
  };
  return { group: g, update, disposables: [...geos, bodyMat, eyeMat, pupilMat] };
}

function buildButterflies({ count = 6, area, colors = ['#e8b74a', '#d97a9c', '#8ecdd9'] }) {
  const g = new THREE.Group();
  const wingGeo = new THREE.PlaneGeometry(0.22, 0.3);
  const flies = [];
  const mats = colors.map((c) => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
  for (let i = 0; i < count; i++) {
    const fly = new THREE.Group();
    const mat = mats[i % mats.length];
    const L = new THREE.Mesh(wingGeo, mat), R = new THREE.Mesh(wingGeo, mat);
    L.position.x = -0.11; R.position.x = 0.11;
    fly.add(L, R);
    fly.position.set(area[0] + (rand() - 0.5) * 6, 1.5 + rand() * 2.5, area[2] + (rand() - 0.5) * 6);
    g.add(fly);
    flies.push({ fly, L, R, ph: rand() * 10, cx: fly.position.x, cz: fly.position.z });
  }
  const update = (t) => {
    flies.forEach(({ fly, L, R, ph, cx, cz }) => {
      const f = Math.sin(t * 16 + ph) * 0.9;
      L.rotation.y = f; R.rotation.y = -f;
      fly.position.x = cx + Math.sin(t * 0.5 + ph) * 1.6;
      fly.position.z = cz + Math.cos(t * 0.4 + ph * 2) * 1.4;
      fly.position.y = 1.6 + Math.sin(t * 0.9 + ph) * 0.7 + Math.sin(t * 5 + ph) * 0.08;
      fly.rotation.y = Math.cos(t * 0.5 + ph) * 0.8;
    });
  };
  return { group: g, update, disposables: [wingGeo, ...mats] };
}

/** Three ancient stelae along the trail — one per job, taller = more recent,
 *  each carved with its glowing year, linked by a golden career path. */
function buildCareerStones(disposables) {
  const g = new THREE.Group();
  const stone = flatMat('#8f8a7a');
  const stoneDark = flatMat('#6e695b');
  const flameMat = new THREE.MeshBasicMaterial({ color: '#ffcf7d' });
  disposables.push(stone, stoneDark, flameMat);
  const mk = (geo, mat, x, y, z, ry = 0) => {
    disposables.push(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    g.add(m);
    return m;
  };

  // glowing year carved into the stone face
  const yearTexture = (year) => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 320;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 128, 320);
    ctx.fillStyle = '#ffd27a';
    ctx.shadowColor = '#ffb75a';
    ctx.shadowBlur = 22;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.translate(64, 150);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '700 72px Oswald, sans-serif';
    ctx.fillText(year, 0, 0);
    ctx.restore();
    // rune scratches above & below the year
    ctx.fillRect(50, 24, 28, 5);
    ctx.fillRect(58, 40, 12, 5);
    ctx.fillRect(46, 282, 36, 5);
    ctx.fillRect(60, 298, 8, 5);
    const tex = new THREE.CanvasTexture(c);
    disposables.push(tex);
    return tex;
  };

  const flames = [];
  const runes = [];
  [
    { x: 4, z: -80, h: 3.4, year: '2024' },   // AshnaAI
    { x: -4, z: -91, h: 4.5, year: '2025' },  // AdsFlicker
    { x: 4, z: -102, h: 5.6, year: '2026' },  // RedCircle
  ].forEach(({ x, z, h, year }, i) => {
    const face = x > 0 ? -Math.PI / 2 : Math.PI / 2; // carving faces the trail
    mk(new THREE.BoxGeometry(2.4, 0.5, 1.9), stoneDark, x, 0.25, z);
    mk(new THREE.BoxGeometry(1.4, h, 1.0), stone, x, 0.5 + h / 2, z, 0.06 * (i % 2 ? -1 : 1));
    mk(new THREE.BoxGeometry(1.6, 0.35, 1.2), stoneDark, x, 0.62 + h, z);
    const runeMat = new THREE.MeshBasicMaterial({ map: yearTexture(year), transparent: true, opacity: 0.9 });
    disposables.push(runeMat);
    const r = mk(new THREE.PlaneGeometry(0.7, h * 0.68), runeMat, x + (x > 0 ? -0.71 : 0.71), 0.6 + h / 2, z, face);
    runes.push(r);
    // torch
    const tx = x + (x > 0 ? -1.7 : 1.7);
    mk(new THREE.CylinderGeometry(0.06, 0.08, 1.5, 5), stoneDark, tx, 0.75, z + 0.9);
    const fl = mk(new THREE.ConeGeometry(0.16, 0.45, 5), flameMat, tx, 1.7, z + 0.9);
    flames.push(fl);
    // moss boulders
    mk(new THREE.IcosahedronGeometry(0.4, 0), stoneDark, x + (x > 0 ? 1.1 : -1.1), 0.3, z + 0.6);
  });

  // the golden career path — a glowing thread linking both chapters
  const pathCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.15, -70),
    new THREE.Vector3(3.2, 0.15, -80),
    new THREE.Vector3(-3.2, 0.15, -91),
    new THREE.Vector3(3.2, 0.15, -102),
    new THREE.Vector3(0, 0.15, -110),
  ]);
  const pathGeo = new THREE.TubeGeometry(pathCurve, 48, 0.06, 5, false);
  const pathMat = new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0.55 });
  disposables.push(pathGeo, pathMat);
  g.add(new THREE.Mesh(pathGeo, pathMat));

  const update = (t) => {
    flames.forEach((f, i) => { f.scale.setScalar(0.85 + Math.sin(t * 12 + i * 2) * 0.18); });
    runes.forEach((r, i) => { r.material.opacity = 0.7 + Math.sin(t * 2.2 + i) * 0.22; });
    pathMat.opacity = 0.4 + Math.sin(t * 1.6) * 0.18;
  };
  return { group: g, update };
}

/** The Empire: four distinct monuments, one per project, on the plateau. */
function buildEmpire(disposables) {
  const g = new THREE.Group();
  const stone = flatMat('#cfc4ae');
  const stoneDark = flatMat('#a99d85');
  const roof = flatMat('#b3593f');
  const gold = new THREE.MeshLambertMaterial({ color: '#e8b74a', emissive: '#4a3408', flatShading: true });
  const glowGold = new THREE.MeshBasicMaterial({ color: '#ffd27a' });
  disposables.push(stone, stoneDark, roof, gold, glowGold);
  const mk = (geo, mat, x, y, z, ry = 0) => {
    disposables.push(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    g.add(m);
    return m;
  };

  const TOP = 4.9; // plateau surface height
  mk(new THREE.CylinderGeometry(16, 19.5, 2.6, 9), stoneDark, HILL.x, 3.6, HILL.z);

  /* Monument I — PAPERX, the Exchange (-3, -127): roofline = rising bar chart */
  const exX = -3, exZ = -127;
  mk(new THREE.BoxGeometry(4.6, 0.6, 3.2), stoneDark, exX, TOP + 0.3, exZ);
  [[-1.5, 1.4], [0, 2.3], [1.5, 3.4]].forEach(([dx, h]) => {
    mk(new THREE.BoxGeometry(1.25, h, 2.6), stone, exX + dx, TOP + 0.6 + h / 2, exZ);
    mk(new THREE.BoxGeometry(1.35, 0.25, 2.7), gold, exX + dx, TOP + 0.72 + h, exZ);
  });
  [-1.7, -0.6, 0.6, 1.7].forEach((dx) => mk(new THREE.CylinderGeometry(0.12, 0.12, 1.5, 6), stone, exX + dx, TOP + 1.35, exZ + 1.7));
  const coin = mk(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 12), glowGold, exX + 1.5, TOP + 5.0, exZ);
  coin.rotation.x = Math.PI / 2;

  /* Monument II — NOTIFYR, the Watchtower (3, -127) */
  const wtX = 3, wtZ = -127;
  mk(new THREE.CylinderGeometry(1.8, 2.2, 3.8, 10), stone, wtX, TOP + 1.9, wtZ);
  mk(new THREE.CylinderGeometry(2.25, 2.25, 0.45, 10), stoneDark, wtX, TOP + 3.95, wtZ);
  mk(new THREE.CylinderGeometry(0.95, 1.15, 0.5, 8), stone, wtX, TOP + 4.45, wtZ);   // lantern deck
  const beacon = mk(new THREE.SphereGeometry(0.5, 12, 12), glowGold, wtX, TOP + 5.15, wtZ);
  mk(new THREE.ConeGeometry(1.3, 0.85, 8), roof, wtX, TOP + 6.1, wtZ);               // cap over the lamp
  mk(new THREE.BoxGeometry(0.38, 0.65, 0.12), gold, wtX, TOP + 1.8, wtZ + 2.0);      // door

  // scan rings pulsing outward from the beacon, staggered
  const scanGeo = new THREE.TorusGeometry(1, 0.055, 6, 30);
  disposables.push(scanGeo);
  const scanRings = [0, 1, 2].map((i) => {
    const m = new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0.5, depthWrite: false });
    disposables.push(m);
    const r = new THREE.Mesh(scanGeo, m);
    r.rotation.x = Math.PI / 2;
    r.position.set(wtX, TOP + 5.15, wtZ);
    g.add(r);
    return { r, ph: i / 3 };
  });

  /* Monument III — REVIEWIQ, the Review Spire (9, -121) */
  const rqX = 9, rqZ = -121;
  mk(new THREE.CylinderGeometry(1.2, 1.6, 5.5, 8), stone, rqX, TOP + 2.75, rqZ);
  mk(new THREE.ConeGeometry(1.4, 1.8, 8), roof, rqX, TOP + 6.4, rqZ);
  const prDocs = [];
  [-0.7, 0, 0.7].forEach((dy, i) => {
    const doc = mk(new THREE.BoxGeometry(1.3, 0.08, 0.95), gold, rqX + 1.7, TOP + 2.4 + dy * 1.1, rqZ, 0.25);
    prDocs.push({ doc, ph: i * 1.4 });
  });
  const reviewOrb = mk(new THREE.SphereGeometry(0.38, 10, 10), glowGold, rqX, TOP + 7.6, rqZ);
  mk(new THREE.BoxGeometry(0.35, 0.6, 0.12), gold, rqX, TOP + 1.6, rqZ + 1.95);

  /* Monument IV — SOUJI, the Observatory (-9, -121) */
  const obX = -9, obZ = -121;
  mk(new THREE.CylinderGeometry(1.6, 2.0, 4.2, 8), stone, obX, TOP + 2.1, obZ);
  mk(new THREE.SphereGeometry(1.85, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), roof, obX, TOP + 4.2, obZ);
  mk(new THREE.BoxGeometry(0.5, 1.6, 0.5), stone, obX + 1.2, TOP + 5.0, obZ, Math.PI / 4); // scope
  const orb = mk(new THREE.SphereGeometry(0.42, 10, 10), glowGold, obX, TOP + 6.3, obZ);
  mk(new THREE.BoxGeometry(0.35, 0.6, 0.12), gold, obX, TOP + 1.6, obZ + 1.95); // door light

  // windows scattered on all monuments
  [[exX - 1.5, exZ + 1.32, 1.4], [exX, exZ + 1.32, 1.8], [exX + 1.5, exZ + 1.32, 2.4], [wtX, wtZ + 1.9, 2.2], [wtX, wtZ + 1.9, 3.3], [rqX, rqZ + 1.9, 2.2], [rqX, rqZ + 1.9, 3.6], [obX, obZ + 1.9, 2.6]]
    .forEach(([x, z, h]) => mk(new THREE.BoxGeometry(0.3, 0.42, 0.1), gold, x, TOP + h, z));

  const update = (t) => {
    prDocs.forEach(({ doc, ph }) => {
      doc.position.y = TOP + 2.4 + Math.sin(t * 1.8 + ph) * 0.12 + (ph / 1.4) * 1.1;
      doc.rotation.y = 0.25 + Math.sin(t * 2.2 + ph) * 0.18;
    });
    reviewOrb.scale.setScalar(1 + Math.sin(t * 2.8) * 0.14);
    orb.scale.setScalar(1 + Math.sin(t * 2.4) * 0.12);
    coin.rotation.z = t * 0.8;
    beacon.scale.setScalar(0.9 + Math.sin(t * 3.4) * 0.16);
    scanRings.forEach(({ r, ph }) => {
      const u = (t * 0.45 + ph) % 1;
      r.scale.setScalar(0.35 + u * 2.4);
      r.material.opacity = 0.55 * (1 - u);
    });
  };
  return { group: g, update };
}

function buildHome(disposables) {
  const g = new THREE.Group();
  const wood = flatMat('#8a6242');
  const woodDark = flatMat('#5f4128');
  const warm = new THREE.MeshBasicMaterial({ color: '#ffd27a' });
  disposables.push(wood, woodDark, warm);
  const Z = HOME.z;
  const mk = (geo, mat, x, y, z, ry = 0) => {
    disposables.push(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    g.add(m);
    return m;
  };
  mk(new THREE.BoxGeometry(7, 4, 6), wood, 0, 2, Z);
  mk(new THREE.ConeGeometry(5.4, 2.7, 4), woodDark, 0, 5.35, Z, Math.PI / 4);
  mk(new THREE.BoxGeometry(1.1, 2.0, 0.12), woodDark, -1.4, 1.0, Z + 3.02);
  const win = mk(new THREE.BoxGeometry(1.2, 0.9, 0.12), warm, 1.4, 2.2, Z + 3.02);
  mk(new THREE.CylinderGeometry(0.11, 0.11, 1.6, 5), woodDark, 2.4, 7.0, Z - 1.2);

  const fire = new THREE.PointLight('#ff9c50', 0, 9, 2);
  fire.position.set(4.2, 0.7, Z + 4.6);
  g.add(fire);
  [[3.9, Z + 4.8], [4.5, Z + 4.4], [4.2, Z + 4.9]].forEach(([x, z]) => {
    const log = mk(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 4), woodDark, x, 0.15, z, rand() * 2);
    log.rotation.z = Math.PI / 2.3;
  });
  const flame = mk(new THREE.ConeGeometry(0.22, 0.6, 5), warm, 4.2, 0.55, Z + 4.6);

  const update = (t, dusk) => {
    fire.intensity = dusk * (1.6 + Math.sin(t * 11) * 0.5 + Math.sin(t * 23) * 0.25);
    flame.scale.setScalar(0.7 + dusk * (0.5 + Math.sin(t * 13) * 0.2));
    win.material.color.setHSL(0.11, 0.85, 0.35 + dusk * 0.35);
  };
  return { group: g, update };
}

/** A screen that types code (or runs a terminal) on a canvas texture. */
function makeScreen(disposables, kind) {
  const W = 512, H = 288;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c);
  disposables.push(tex);

  // [color, text] tokens per line
  const CODE = [
    [['#5f7e97', '// shubham.dev — 2:00 AM']],
    [['#c792ea', 'const '], ['#82aaff', 'me'], ['#d6deeb', ' = '], ['#c792ea', 'new '], ['#ffcb6b', 'Engineer'], ['#d6deeb', '('], ['#ecc48d', "'Shubham'"], ['#d6deeb', ');']],
    [['#82aaff', 'me'], ['#d6deeb', '.stack = ['], ['#ecc48d', "'React'"], ['#d6deeb', ', '], ['#ecc48d', "'Node'"], ['#d6deeb', ', '], ['#ecc48d', "'AI'"], ['#d6deeb', '];']],
    [[]],
    [['#c792ea', 'async function '], ['#82aaff', 'ship'], ['#d6deeb', '(idea) {']],
    [['#d6deeb', '  '], ['#c792ea', 'const '], ['#82aaff', 'product'], ['#d6deeb', ' = '], ['#c792ea', 'await '], ['#82aaff', 'me'], ['#d6deeb', '.build(idea);']],
    [['#d6deeb', '  '], ['#c792ea', 'return '], ['#82aaff', 'product'], ['#d6deeb', '.deploy();']],
    [['#d6deeb', '}']],
    [[]],
    [['#c792ea', 'while '], ['#d6deeb', '('], ['#89ddff', 'true'], ['#d6deeb', ') {']],
    [['#d6deeb', '  ship(nextWildIdea()); '], ['#5f7e97', '// every night']],
    [['#d6deeb', '}']],
  ];
  const TERM = [
    ['#d6deeb', '$ npm run build'],
    ['#5da963', '✓ jungle built in 0.4s'],
    ['#d6deeb', '$ node agents/deploy.js'],
    ['#e8b74a', '▲ deploying to prod…'],
    ['#5da963', '✓ live — still shipping'],
  ];

  const total = kind === 'terminal'
    ? TERM.length
    : CODE.reduce((n, ln) => n + ln.reduce((m, tk) => m + (tk[1] ? tk[1].length : 0), 0), 0);
  let shown = 0, lastStep = 0, doneAt = 0;

  const draw = (t) => {
    ctx.fillStyle = kind === 'terminal' ? '#0b120e' : '#10151d';
    ctx.fillRect(0, 0, W, H);
    ctx.font = '15px Menlo, Consolas, monospace';
    ctx.textBaseline = 'top';
    const blink = Math.floor(t * 2.4) % 2 === 0;
    if (kind === 'terminal') {
      const lines = Math.min(TERM.length, shown);
      for (let i = 0; i < lines; i++) {
        ctx.fillStyle = TERM[i][0];
        ctx.fillText(TERM[i][1], 18, 20 + i * 26);
      }
      if (blink) { ctx.fillStyle = '#5da963'; ctx.fillRect(18, 20 + lines * 26, 9, 17); }
    } else {
      ctx.fillStyle = '#1c2531';
      ctx.fillRect(0, 0, 34, H);
      let budget = shown, cy = 14;
      for (let i = 0; i < CODE.length; i++) {
        ctx.fillStyle = '#3b4a5a';
        ctx.fillText(String(i + 1), 8, cy);
        let cx = 44;
        for (const [col, txt] of CODE[i]) {
          if (!txt || budget <= 0) break;
          const part = txt.slice(0, budget);
          ctx.fillStyle = col;
          ctx.fillText(part, cx, cy);
          cx += ctx.measureText(part).width;
          budget -= part.length;
          if (budget <= 0 && blink) { ctx.fillStyle = '#ffd27a'; ctx.fillRect(cx + 1, cy, 8, 16); }
        }
        cy += 21;
        if (budget <= 0) break;
      }
      if (shown >= total && blink) { ctx.fillStyle = '#ffd27a'; ctx.fillRect(44, cy, 8, 16); }
    }
    tex.needsUpdate = true;
  };
  draw(0);

  const step = kind === 'terminal' ? 0.9 : 0.05;
  const update = (t) => {
    if (shown < total) {
      if (t - lastStep > step) { shown += kind === 'terminal' ? 1 : 1 + Math.floor(Math.random() * 3); lastStep = t; draw(t); }
    } else {
      if (!doneAt) doneAt = t;
      if (t - doneAt > 4) { shown = 0; doneAt = 0; }         // loop after a pause
      if (t - lastStep > 0.35) { lastStep = t; draw(t); }     // keep the cursor blinking
    }
  };
  return { tex, update };
}

/** Inside the hut: cozy room, desk setup, and me — coding at 2 AM. */
function buildInterior(disposables) {
  const g = new THREE.Group();
  const Z = HOME.z;
  const mk = (geo, mat, x, y, z, ry = 0) => {
    disposables.push(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    g.add(m);
    return m;
  };

  // room shell — BackSide so it's only visible from within
  const wallMat = new THREE.MeshLambertMaterial({ color: '#5c4430', side: THREE.BackSide, flatShading: true });
  disposables.push(wallMat);
  mk(new THREE.BoxGeometry(6.8, 3.8, 5.8), wallMat, 0, 1.95, Z);

  const woodDark = flatMat('#4a3222');
  const woodMid  = flatMat('#7a5a3c');
  disposables.push(woodDark, woodMid);

  // rug
  const rugGeo = new THREE.CircleGeometry(1.5, 18);
  rugGeo.rotateX(-Math.PI / 2);
  mk(rugGeo, flatMat('#a1543c'), 0, 0.14, Z + 0.6);

  // desk against the back wall
  mk(new THREE.BoxGeometry(2.5, 0.1, 0.95), woodMid, 0.9, 1.12, Z - 1.95);
  [[-1.1, -0.35], [1.1, -0.35], [-1.1, 0.35], [1.1, 0.35]].forEach(([dx, dz]) =>
    mk(new THREE.BoxGeometry(0.08, 1.08, 0.08), woodDark, 0.9 + dx, 0.56, Z - 1.95 + dz));

  // monitor — a live code editor typing away
  const codeScreen = makeScreen(disposables, 'code');
  const screenMat = new THREE.MeshBasicMaterial({ map: codeScreen.tex });
  disposables.push(screenMat);
  mk(new THREE.BoxGeometry(0.14, 0.3, 0.1), woodDark, 0.9, 1.3, Z - 2.25);
  mk(new THREE.BoxGeometry(1.15, 0.65, 0.06), flatMat('#20242c'), 0.9, 1.68, Z - 2.28);
  mk(new THREE.PlaneGeometry(1.02, 0.54), screenMat, 0.9, 1.68, Z - 2.24);

  // laptop — a terminal running the deploy
  const termScreen = makeScreen(disposables, 'terminal');
  const lapMat = new THREE.MeshBasicMaterial({ map: termScreen.tex });
  disposables.push(lapMat);
  mk(new THREE.BoxGeometry(0.6, 0.04, 0.4), flatMat('#2c313a'), 0.35, 1.19, Z - 1.75, 0.4);
  const lapScreen = mk(new THREE.BoxGeometry(0.6, 0.4, 0.03), flatMat('#2c313a'), 0.22, 1.4, Z - 1.9, 0.4);
  lapScreen.rotation.x = -0.25;
  const lapGlow = mk(new THREE.PlaneGeometry(0.52, 0.32), lapMat, 0.235, 1.41, Z - 1.87, 0.4);
  lapGlow.rotation.x = -0.25;

  // mug
  mk(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 8), flatMat('#b3593f'), 1.8, 1.24, Z - 1.8);

  // chair
  mk(new THREE.BoxGeometry(0.62, 0.09, 0.6), woodDark, 0.9, 0.62, Z - 0.95);
  mk(new THREE.BoxGeometry(0.62, 0.85, 0.09), woodDark, 0.9, 1.1, Z - 0.62);
  [[-0.25, -0.22], [0.25, -0.22], [-0.25, 0.22], [0.25, 0.22]].forEach(([dx, dz]) =>
    mk(new THREE.BoxGeometry(0.06, 0.6, 0.06), woodDark, 0.9 + dx, 0.31, Z - 0.95 + dz));

  // ── me ──
  const hoodie = flatMat('#33415c');
  const skin = flatMat('#d9a077');
  const hairM = flatMat('#221a14');
  disposables.push(hoodie, skin, hairM);
  // legs
  [[0.76], [1.04]].forEach(([lx]) => {
    mk(new THREE.BoxGeometry(0.15, 0.14, 0.5), hoodie, lx, 0.66, Z - 1.18);            // thigh
    mk(new THREE.BoxGeometry(0.13, 0.42, 0.13), flatMat('#28303f'), lx, 0.34, Z - 1.4); // shin
    mk(new THREE.BoxGeometry(0.15, 0.09, 0.28), hairM, lx, 0.12, Z - 1.47);             // shoe
  });
  // torso
  mk(new THREE.BoxGeometry(0.56, 0.78, 0.32), hoodie, 0.9, 1.12, Z - 1.0);
  mk(new THREE.SphereGeometry(0.17, 8, 8), hoodie, 0.9, 1.5, Z - 0.92); // hood bump
  // arms — animated typing
  const arms = [];
  [[0.62], [1.18]].forEach(([ax], i) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.55), hoodie);
    disposables.push(arm.geometry);
    arm.position.set(ax, 1.05, Z - 1.35);
    arm.rotation.x = -0.35;
    g.add(arm);
    arms.push({ arm, ph: i * Math.PI });
  });
  // head
  const headG = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), skin);
  disposables.push(head.geometry);
  headG.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 10, 0, Math.PI * 2, 0, Math.PI / 1.9), hairM);
  disposables.push(hair.geometry);
  hair.position.y = 0.045;
  headG.add(hair);
  const specs = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.03), hairM);
  disposables.push(specs.geometry);
  specs.position.set(0, 0.02, -0.185);
  headG.add(specs);
  headG.position.set(0.9, 1.72, Z - 1.02);
  g.add(headG);

  // floor lamp
  mk(new THREE.CylinderGeometry(0.16, 0.2, 0.06, 8), woodDark, -1.7, 0.15, Z - 1.8);
  mk(new THREE.CylinderGeometry(0.03, 0.03, 1.7, 5), woodDark, -1.7, 1.0, Z - 1.8);
  mk(new THREE.ConeGeometry(0.3, 0.35, 8), flatMat('#e8c07a'), -1.7, 1.95, Z - 1.8);
  const lampLight = new THREE.PointLight('#ffb066', 1.4, 8, 1.8);
  lampLight.position.set(-1.7, 1.8, Z - 1.7);
  g.add(lampLight);
  const screenLight = new THREE.PointLight('#7dd3fc', 0.9, 5, 2);
  screenLight.position.set(0.9, 1.6, Z - 1.7);
  g.add(screenLight);

  // shelf + books
  mk(new THREE.BoxGeometry(1.5, 0.07, 0.35), woodMid, -2.9, 2.1, Z - 0.4);
  ['#b3593f', '#e8b74a', '#5da963', '#7dd3fc', '#d97a9c'].forEach((c, i) =>
    mk(new THREE.BoxGeometry(0.12, 0.32 + (i % 3) * 0.05, 0.24), flatMat(c), -3.4 + i * 0.17, 2.32, Z - 0.4));

  // plant
  mk(new THREE.CylinderGeometry(0.2, 0.16, 0.3, 7), flatMat('#8a5a3a'), 2.8, 0.3, Z + 2.2);
  mk(new THREE.IcosahedronGeometry(0.42, 0), flatMat('#4f9d45'), 2.8, 0.85, Z + 2.2);

  // window with night sky
  mk(new THREE.BoxGeometry(1.6, 1.2, 0.08), woodDark, -1.3, 2.1, Z - 2.83);
  const nightMat = new THREE.MeshBasicMaterial({ color: '#16203d' });
  disposables.push(nightMat);
  mk(new THREE.PlaneGeometry(1.4, 1.0), nightMat, -1.3, 2.1, Z - 2.78);

  const update = (t) => {
    arms.forEach(({ arm, ph }) => { arm.rotation.x = -0.35 + Math.sin(t * 9 + ph) * 0.08; });
    headG.rotation.x = Math.sin(t * 1.3) * 0.045;
    headG.rotation.y = Math.sin(t * 0.4) * 0.12;
    codeScreen.update(t);
    termScreen.update(t);
    screenLight.intensity = 0.85 + Math.sin(t * 7.3) * 0.12;
    lampLight.intensity = 1.35 + Math.sin(t * 40) * 0.05;
  };
  return { group: g, update };
}

/* ═══════════════ component ═══════════════ */

export default function Jungle() {
  const sectionRef = useRef(null);
  const canvasRef  = useRef(null);
  const doorFadeRef = useRef(null);
  const overlayRefs = useRef([]);

  useEffect(() => {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: window.devicePixelRatio <= 1.5, powerPreference: 'high-performance' });
    } catch { return undefined; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const disposables = [];
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(SKY[0].sky);
    scene.fog = new THREE.FogExp2(SKY[0].fog, 0.015);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 300);
    camera.position.set(...CAM[0][1]);

    const hemi = new THREE.HemisphereLight('#eaf6ff', '#3c5a36', 1.0);
    const sun  = new THREE.DirectionalLight('#ffffff', 1.4);
    sun.position.set(-40, 55, -20);
    scene.add(hemi, sun);

    // sun disc + glow sprite
    const sunBall = new THREE.Mesh(new THREE.SphereGeometry(4, 12, 12), new THREE.MeshBasicMaterial({ color: '#fff3cf' }));
    disposables.push(sunBall.geometry, sunBall.material);
    scene.add(sunBall);
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 128;
    const gctx = glowCanvas.getContext('2d');
    const grad = gctx.createRadialGradient(64, 64, 6, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,240,200,0.9)');
    grad.addColorStop(1, 'rgba(255,240,200,0)');
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(glowCanvas);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false }));
    glow.scale.setScalar(34);
    disposables.push(glowTex, glow.material);
    scene.add(glow);

    // world
    scene.add(buildTerrain(disposables));
    buildTrees(disposables).forEach((m) => { scene.add(m); disposables.push(m); });

    // clouds
    const cloudMat = new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true, transparent: true, opacity: 0.85 });
    const cloudGeo = new THREE.IcosahedronGeometry(1, 0);
    disposables.push(cloudMat, cloudGeo);
    const clouds = [];
    for (let i = 0; i < 10; i++) {
      const c = new THREE.Group();
      for (let b = 0; b < 4; b++) {
        const m = new THREE.Mesh(cloudGeo, cloudMat);
        m.position.set(b * 1.6 - 2.4 + rand(), rand() * 0.5, rand() - 0.5);
        m.scale.set(1.5 + rand() * 1.6, 0.9 + rand() * 0.5, 1.1 + rand());
        c.add(m);
      }
      c.position.set((rand() - 0.5) * 170, 20 + rand() * 12, 30 - rand() * 200);
      scene.add(c);
      clouds.push({ c, sp: 0.3 + rand() * 0.5 });
    }

    // cast
    const actors = [];
    const addActor = (a) => { scene.add(a.group); (a.disposables || []).forEach((d) => disposables.push(d)); actors.push(a); };
    addActor(buildQuadruped({ body: [0.7, 0.55, 1.35], head: 0.5, legs: [0.07, 0.55], tail: [0.16, 0.8], ears: true, anchor: [3, 0, -6], radius: 2.4, speed: 0.55, scale: 1, colorBody: '#d97a3f', colorHead: '#e8934f', colorLeg: '#8a4b26' }));
    addActor(buildQuadruped({ body: [1.0, 0.75, 1.9], head: 0.62, legs: [0.1, 0.7], tail: [0.14, 1.0], ears: true, anchor: [-4, 0, -22], radius: 2.9, speed: 0.34, scale: 1.15, colorBody: '#d9903f', colorHead: '#e3a45c', colorLeg: '#96622a' }));
    addActor(buildSerpent({ anchor: [3.5, 0, -38] }));
    addActor(buildQuadruped({ body: [1.7, 1.5, 2.6], head: 1.0, legs: [0.22, 1.1], ears: false, trunk: 0.22, anchor: [-5, 0, -54], radius: 3.4, speed: 0.16, scale: 1.25, colorBody: '#9aa2ad', colorHead: '#8b939e', colorLeg: '#7d858f' }));
    addActor(buildOwl({ anchor: [4, 0, -70] }));
    addActor(buildButterflies({ count: 6, area: [0, 0, -4] }));
    addActor(buildButterflies({ count: 4, area: [-2, 0, HOME.z + 5], colors: ['#ffe9a8'] }));
    const stones = buildCareerStones(disposables); scene.add(stones.group); actors.push(stones);
    const empire = buildEmpire(disposables); scene.add(empire.group); actors.push(empire);
    const home = buildHome(disposables); scene.add(home.group);
    const interior = buildInterior(disposables); scene.add(interior.group); actors.push(interior);

    // soft round sprite for all point clouds
    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = dotCanvas.height = 64;
    const dctx = dotCanvas.getContext('2d');
    const dgrad = dctx.createRadialGradient(32, 32, 2, 32, 32, 32);
    dgrad.addColorStop(0, 'rgba(255,255,255,1)');
    dgrad.addColorStop(0.4, 'rgba(255,255,255,0.6)');
    dgrad.addColorStop(1, 'rgba(255,255,255,0)');
    dctx.fillStyle = dgrad;
    dctx.fillRect(0, 0, 64, 64);
    const dotTex = new THREE.CanvasTexture(dotCanvas);
    disposables.push(dotTex);

    // fireflies near home (dusk)
    const ffGeo = new THREE.BufferGeometry();
    const ffN = 220;
    const ffPos = new Float32Array(ffN * 3);
    for (let i = 0; i < ffN; i++) {
      ffPos[i * 3] = (rand() - 0.5) * 28;
      ffPos[i * 3 + 1] = 0.5 + rand() * 5;
      ffPos[i * 3 + 2] = HOME.z + 14 - rand() * 30;
    }
    ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
    const ffMat = new THREE.PointsMaterial({ color: 0xffe9a8, size: 0.22, map: dotTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    disposables.push(ffGeo, ffMat);
    scene.add(new THREE.Points(ffGeo, ffMat));

    // stars for the dusk sky
    const stGeo = new THREE.BufferGeometry();
    const stN = 350;
    const stPos = new Float32Array(stN * 3);
    for (let i = 0; i < stN; i++) {
      stPos[i * 3] = (rand() - 0.5) * 240;
      stPos[i * 3 + 1] = 30 + rand() * 70;
      stPos[i * 3 + 2] = -50 - rand() * 160;
    }
    stGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3));
    const stMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, map: dotTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    disposables.push(stGeo, stMat);
    scene.add(new THREE.Points(stGeo, stMat));

    /* ── drive ── */
    const drive = { target: 0, prog: 0 };
    const mouse = { x: 0, y: 0 };
    let inView = true, rafId = 0;

    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouse);

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    const colA = new THREE.Color(), colB = new THREE.Color();
    const lerpKeys = (keys, p, prop, target) => {
      let i = 0;
      while (i < keys.length - 2 && keys[i + 1].p < p) i++;
      const a = keys[i], b = keys[i + 1];
      const u = THREE.MathUtils.clamp((p - a.p) / (b.p - a.p), 0, 1);
      target.copy(colA.set(a[prop])).lerp(colB.set(b[prop]), u);
      return a.sunI + (b.sunI - a.sunI) * u;
    };

    const vA = new THREE.Vector3(), vB = new THREE.Vector3(), look = new THREE.Vector3();
    const camAt = (p) => {
      let i = 0;
      while (i < CAM.length - 2 && CAM[i + 1][0] < p) i++;
      const [pa, posA, lookA] = CAM[i];
      const [pb, posB, lookB] = CAM[i + 1];
      const u = THREE.MathUtils.smoothstep(THREE.MathUtils.clamp((p - pa) / (pb - pa), 0, 1), 0, 1);
      camera.position.lerpVectors(vA.set(...posA), vB.set(...posB), u);
      look.lerpVectors(vA.set(...lookA), vB.set(...lookB), u);
    };

    let last = performance.now(), elapsed = 0;
    function loop() {
      cancelAnimationFrame(rafId);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      const t = elapsed;

      drive.prog += (drive.target - drive.prog) * 0.055; // cinematic damping
      const p = drive.prog;

      const sunI = lerpKeys(SKY, p, 'sky', scene.background);
      lerpKeys(SKY, p, 'fog', scene.fog.color);
      lerpKeys(SKY, p, 'sun', sun.color);
      sun.intensity = sunI;
      let i = 0; while (i < SKY.length - 2 && SKY[i + 1].p < p) i++;
      const u = THREE.MathUtils.clamp((p - SKY[i].p) / (SKY[i + 1].p - SKY[i].p), 0, 1);
      hemi.intensity = SKY[i].hemiI + (SKY[i + 1].hemiI - SKY[i].hemiI) * u;

      const sa = Math.PI * (0.15 + p * 0.75);
      sunBall.position.set(Math.cos(sa) * 90, 12 + Math.sin(sa) * 55, camera.position.z - 110);
      glow.position.copy(sunBall.position);
      glow.material.opacity = Math.max(0.15, Math.sin(sa));
      sun.position.copy(sunBall.position).add(vA.set(0, 10, 40));

      const dusk = THREE.MathUtils.smoothstep(p, 0.88, 0.97);
      ffMat.opacity = dusk * (0.55 + Math.sin(t * 2.2) * 0.25);
      stMat.opacity = dusk * 0.9;
      home.update(t, dusk);

      camAt(p);
      const parallax = p > 0.96 ? 0.12 : 1; // gentler sway indoors
      camera.position.x += mouse.x * 0.5 * parallax;
      camera.position.y += mouse.y * 0.3 * parallax;
      camera.lookAt(look);

      // blink-cut as the camera passes through the door
      if (doorFadeRef.current) {
        const dfade = Math.max(0, 1 - Math.abs(p - 0.9715) / 0.0095);
        doorFadeRef.current.style.opacity = dfade.toFixed(3);
      }

      actors.forEach((a) => a.update && a.update(t));
      clouds.forEach(({ c, sp }) => { c.position.x += Math.sin(t * 0.05 + sp) * 0.004 + 0.006 * sp; if (c.position.x > 115) c.position.x = -115; });

      // overlays — animate the inner card, never the positioned wrapper
      overlayRefs.current.forEach((el, idx) => {
        if (!el) return;
        const ch = CHAPTERS[idx];
        const [a, b] = ch.range;
        const fade = 0.022;
        const alpha = THREE.MathUtils.clamp(Math.min((p - a) / fade, (b - p) / fade, 1), 0, 1);
        el.style.opacity = alpha.toFixed(3);
        const card = el.firstElementChild;
        if (card) card.style.transform = `translateY(${(1 - alpha) * 26}px)`;
        el.style.pointerEvents = (ch.cta || ch.link || ch.links?.length) && alpha > 0.4 ? 'auto' : 'none';
      });

      renderer.render(scene, camera);
      if (inView) rafId = requestAnimationFrame(loop);
    }

    // Created last: onToggle fires synchronously during create() and calls loop(),
    // so everything loop() touches must already exist.
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => { drive.target = self.progress; },
    });
    const stNear = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => { inView = self.isActive; if (inView) loop(); else cancelAnimationFrame(rafId); },
    });

    if (import.meta.env.DEV) window.__jungle = { drive, tick: loop, scene, camera, renderer };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      st.kill();
      stNear.kill();
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', resize);
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <section ref={sectionRef} id="jungle" className="panel relative bg-[#081310]" style={{ zIndex: 1, height: `${SECTION_VH}vh` }}>
      <div className="h-screen sticky top-0 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div ref={doorFadeRef} className="absolute inset-0 bg-black pointer-events-none z-20" style={{ opacity: 0 }} />

        {CHAPTERS.map((ch, i) => (
          <div key={i} ref={(el) => (overlayRefs.current[i] = el)}
            className={`absolute z-10 w-full px-6 ${
              ch.hint || ch.cta || (!ch.stack && !ch.points)
                ? 'left-1/2 -translate-x-1/2 text-center ' + (ch.hint ? 'top-[14%]' : 'bottom-[10%]')
                : i % 2 === 0
                  ? 'left-0 md:left-10 bottom-[7%] md:max-w-3xl'
                  : 'right-0 md:right-10 bottom-[7%] md:max-w-3xl md:ml-auto'
            }`}
            style={{ opacity: 0, pointerEvents: 'none', willChange: 'opacity' }}>
            <div className="inline-block rounded-3xl px-7 py-6 md:px-10 md:py-8 max-w-full"
              style={{ background: 'rgba(6, 18, 12, 0.62)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', willChange: 'transform' }}>
              <p className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#ffe9a8] mb-2 md:mb-3">{ch.label}</p>
              <h2 className="display text-5xl md:text-8xl text-white leading-[0.9] mb-3 md:mb-4">{ch.title}</h2>

              {ch.company && (
                <p className="mb-3 md:mb-4">
                  <span className="text-xl md:text-3xl font-bold text-[#ffe9a8]">@ {ch.company}</span>
                  <span className="block md:inline text-sm md:text-lg text-white/60 md:ml-3">{ch.period}</span>
                </p>
              )}

              {ch.plain && (
                <p className="text-lg md:text-2xl text-white/90 font-light leading-snug mb-3 md:mb-4">{ch.plain}</p>
              )}
              {ch.body && (
                <p className="text-sm md:text-base text-gray-200/80 leading-relaxed">{ch.body}</p>
              )}

              {ch.points && (
                <ul className="space-y-1.5 mb-4 text-left">
                  {ch.points.map((pt, j) => (
                    <li key={j} className="flex gap-2 text-xs md:text-sm text-gray-200/85 leading-relaxed">
                      <span className="text-[#ffe9a8] shrink-0">•</span>{pt}
                    </li>
                  ))}
                </ul>
              )}

              {ch.stack && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {ch.stack.map((s) => (
                    <span key={s}
                      className="px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold text-[#ffe9a8] border border-[#ffe9a8]/30 bg-[#ffe9a8]/10 whitespace-nowrap">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {ch.level && (
                <p className="text-[10px] md:text-xs tracking-[0.25em] uppercase text-white/50">• {ch.level}</p>
              )}

              {ch.links && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {ch.links.map((l) => (
                    <a key={l.href} {...(l.primary !== false ? { 'data-magnetic': true } : {})}
                      href={l.href} target="_blank" rel="noopener noreferrer"
                      className={`inline-block px-7 py-2.5 rounded-full text-sm font-bold transition-colors ${
                        l.primary !== false
                          ? 'bg-[#ffe9a8] text-black hover:bg-white'
                          : 'text-white border border-white/30 hover:bg-white/10 font-semibold'
                      }`}>
                      {l.label}
                    </a>
                  ))}
                </div>
              )}

              {ch.link && (
                <a data-magnetic href={ch.link.href} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-3 px-7 py-2.5 rounded-full bg-[#ffe9a8] text-black text-sm font-bold hover:bg-white transition-colors">
                  {ch.link.label}
                </a>
              )}

              {ch.hint && (
                <p className="mt-4 text-[10px] tracking-[0.3em] uppercase text-white/50 animate-pulse">Scroll to enter ↓</p>
              )}
              {ch.cta && (
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <a data-magnetic href="mailto:shubh.varshneycode@gmail.com"
                    className="px-7 py-3 text-sm font-bold text-black rounded-full bg-[#ffe9a8] hover:bg-white transition-colors">
                    Hire Me
                  </a>
                  <a href="/shubhamxcode.pdf" download="Shubham-Varshney-Resume.pdf"
                    className="px-7 py-3 text-sm font-semibold text-white rounded-full border border-white/30 hover:bg-white/10 transition-colors">
                    Resume
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
