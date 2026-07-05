import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * SHUBHAM'S JUNGLE — a scroll-driven 3D movie.
 * The camera flies through a low-poly jungle at dawn, meets the animals of the
 * stack (they walk, prowl, slither, sway), climbs the empire hill at sunset,
 * and arrives home at dusk. One canvas, ScrollTrigger owns the camera,
 * rendering pauses when the section leaves the screen.
 */

const SECTION_VH = 900; // scroll length of the movie

/* ── deterministic pseudo-noise for terrain & scatter ── */
const n2 = (x, z) =>
  Math.sin(x * 0.16) * Math.cos(z * 0.13) * 1.4 +
  Math.sin(x * 0.045 + 1.7) * Math.cos(z * 0.06 + 4.2) * 3.2 +
  Math.sin(x * 0.4 + z * 0.33) * 0.35;

const rand = (() => { let s = 42; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

/* ── sky / light keyframes: dawn → day → sunset → dusk ── */
const SKY = [
  { p: 0.00, sky: '#f6c185', fog: '#eeb887', sun: '#ffdca8', sunI: 1.25, hemiI: 0.95 },
  { p: 0.22, sky: '#bfe4f0', fog: '#cdeada', sun: '#fff4d8', sunI: 1.45, hemiI: 1.15 },
  { p: 0.52, sky: '#a5d7e6', fog: '#b7e0c8', sun: '#ffffff', sunI: 1.50, hemiI: 1.20 },
  { p: 0.72, sky: '#f0a267', fog: '#e0935e', sun: '#ff9c50', sunI: 1.05, hemiI: 0.80 },
  { p: 0.88, sky: '#2d3f68', fog: '#253354', sun: '#8090ca', sunI: 0.50, hemiI: 0.52 },
  { p: 1.00, sky: '#131c36', fog: '#0f172e', sun: '#4a5a94', sunI: 0.35, hemiI: 0.42 },
];

/* ── camera keyframes: [progress, camPos, lookAt] ── */
const CAM = [
  [0.00, [0, 30, 40],    [0, 0, -30]],
  [0.10, [0, 5, 16],     [0, 2, -12]],
  [0.17, [7, 2.6, 1],    [3, 0.8, -6]],    // fox
  [0.26, [-8, 2.8, -15], [-4, 1.0, -22]],  // tiger
  [0.35, [7.5, 2.4, -31],[3.5, 0.5, -38]], // serpent
  [0.45, [-9, 3.4, -46], [-5, 1.8, -54]],  // elephant
  [0.55, [8, 4.2, -63],  [4, 4.0, -70]],   // owl
  [0.66, [0, 9, -70],    [0, 8, -95]],     // empire approach — above the hillside
  [0.78, [9, 12, -79],   [0, 7, -96]],     // empire close — orbiting the towers
  [0.90, [4.5, 3.6, -101], [0, 2, -114]],  // home — angled approach
  [1.00, [0, 3.8, -106], [0, 5, -122]],    // rest — sky & fireflies
];

/* ── the cast: html overlay chapters [start, end] ── */
const CHAPTERS = [
  {
    range: [0.00, 0.105], hint: true,
    label: 'Welcome to my world', title: "SHUBHAM'S JUNGLE",
    body: 'Full-Stack Engineer · 2+ years shipping production web apps. Every animal in this jungle is a technology I use every day. Scroll — they\'re awake.',
  },
  {
    range: [0.13, 0.215],
    label: 'Species 01 · The React Fox', title: 'FRONTEND',
    plain: 'I build fast, beautiful interfaces that users love.',
    stack: ['React', 'Next.js', 'Redux · RTK Query', 'TanStack Query', 'Tailwind CSS'],
    level: '2+ years in production',
  },
  {
    range: [0.22, 0.305],
    label: 'Species 02 · The Type Tiger', title: 'LANGUAGES',
    plain: 'I write strictly typed code that survives production.',
    stack: ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Swift'],
    level: 'TypeScript-first, end to end',
  },
  {
    range: [0.31, 0.395],
    label: 'Species 03 · The Python Serpent', title: 'AI ENGINEERING',
    plain: 'I ship AI products — autonomous agents, vision, and voice.',
    stack: ['LLM Integration (Gemini)', 'AI Agents', 'Browser Automation', 'Whisper STT', 'Vector Embeddings'],
    level: 'Shipped 4 AI-powered products',
  },
  {
    range: [0.40, 0.50],
    label: 'Species 04 · The Postgres Elephant', title: 'DATABASES',
    plain: 'I design data layers that never forget a single row.',
    stack: ['PostgreSQL', 'MongoDB', 'Redis', 'Supabase', 'Drizzle ORM'],
    level: 'Modeled, indexed & scaled in production',
  },
  {
    range: [0.50, 0.60],
    label: 'Species 05 · The Node Owl', title: 'BACKEND & CLOUD',
    plain: 'I build APIs that serve thousands of requests without blocking.',
    stack: ['Node.js', 'Express', 'REST APIs', 'GraphQL', 'WebSockets', 'AWS', 'Docker', 'GitHub Actions'],
    level: 'Event-driven · real-time · deployed',
  },
  {
    range: [0.62, 0.86],
    label: 'What I built', title: 'MY EMPIRE',
    body: 'Souji — a JARVIS for macOS · PaperX — paper trading for Indian markets · ReviewIQ — AI code review · DevBond — where developers connect.',
  },
  {
    range: [0.875, 1.0], cta: true,
    label: 'The hut at the edge of the jungle', title: 'WHERE I LIVE',
    body: 'Open to full-time roles and wild ideas. The fireflies are my AI agents — they work while I sleep.',
  },
];

/* ═══════════════ builders ═══════════════ */

function flatMat(color, extra = {}) {
  return new THREE.MeshLambertMaterial({ color, flatShading: true, ...extra });
}

function buildTerrain(disposables) {
  const geo = new THREE.PlaneGeometry(240, 220, 96, 88);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = [];
  const c1 = new THREE.Color('#2e6b3f'), c2 = new THREE.Color('#5da963'), c3 = new THREE.Color('#8ec978');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i) - 55;
    const trail = THREE.MathUtils.smoothstep(Math.abs(x), 5, 16); // keep the walking trail low
    let y = Math.max(0, n2(x, z)) * trail;
    if (z < -75 && z > -112 && Math.abs(x) < 22) y += (1 - THREE.MathUtils.smoothstep(Math.hypot(x, z + 95), 6, 22)) * 5; // empire hill
    pos.setY(i, y);
    const t = Math.min(1, y / 4.5);
    const c = t < 0.5 ? c1.clone().lerp(c2, t * 2) : c2.clone().lerp(c3, (t - 0.5) * 2);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  disposables.push(geo, mat);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.z = -55 + 55; // keep local math simple: plane spans z in [-165, 55]
  return mesh;
}

function buildTrees(disposables) {
  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.26, 1.6, 5);
  const canopyGeo = new THREE.IcosahedronGeometry(1.15, 0);
  const trunkMat = flatMat('#6b4a33');
  const canopyMat = new THREE.MeshLambertMaterial({ flatShading: true, color: '#ffffff' });
  disposables.push(trunkGeo, canopyGeo, trunkMat, canopyMat);

  const N = 240;
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, N);
  const canopies = new THREE.InstancedMesh(canopyGeo, canopyMat, N);
  const dummy = new THREE.Object3D();
  const greens = ['#3f8a4d', '#57a45c', '#2f7a44', '#6fb56a', '#48945a'];
  let placed = 0, guard = 0;
  while (placed < N && guard++ < 4000) {
    const x = (rand() - 0.5) * 190;
    const z = 30 - rand() * 185;
    if (Math.abs(x) < 7.5 && z > -78) continue;            // clear the trail
    if (Math.hypot(x, z + 95) < 20 && z < -75) continue;   // clear the empire hill
    if (Math.hypot(x, z + 114) < 9) continue;              // clear home
    const s = 0.8 + rand() * 1.9;
    const y = Math.max(0, n2(x, z - 0)) * THREE.MathUtils.smoothstep(Math.abs(x), 5, 16);
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

  let trunkParts = [];
  if (trunk) {
    let py = headM.position.y - head * 0.2, pz = headM.position.z + head * 0.45;
    for (let i = 0; i < 4; i++) {
      const seg = mk(new THREE.CylinderGeometry(trunk * (1 - i * 0.16), trunk * (1 - (i + 1) * 0.16), 0.5, 6), mats[1]);
      seg.position.set(0, py - i * 0.42, pz + i * 0.1);
      trunkParts.push(seg);
    }
  }

  g.scale.setScalar(scale);
  const walkBob = { t: rand() * 10 };
  const update = (t) => {
    walkBob.t = t * speed;
    const a = walkBob.t;
    g.position.set(anchor[0] + Math.sin(a) * radius, anchor[1], anchor[2] + Math.cos(a) * radius);
    g.rotation.y = a + Math.PI / 2;
    legMeshes.forEach((leg) => { leg.rotation.x = Math.sin(t * 5 * Math.max(speed, 0.35) + leg.userData.phase) * 0.55; });
    bodyM.position.y += 0; // bob applied on group
    g.position.y = anchor[1] + Math.abs(Math.sin(t * 5 * Math.max(speed, 0.35))) * 0.05 * scale;
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
  const faceMat = flatMat('#c9b391');
  const geos = [];
  const mk = (geo, mat) => { geos.push(geo); const m = new THREE.Mesh(geo, mat); g.add(m); return m; };

  // perch tree
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
  return { group: g, update, disposables: [...geos, bodyMat, faceMat, eyeMat, pupilMat] };
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

function buildEmpire(disposables) {
  const g = new THREE.Group();
  const stone = flatMat('#cfc4ae');
  const stoneDark = flatMat('#a99d85');
  const roof = flatMat('#b3593f');
  const gold = new THREE.MeshLambertMaterial({ color: '#e8b74a', emissive: '#4a3408', flatShading: true });
  disposables.push(stone, stoneDark, roof, gold);
  const mk = (geo, mat, x, y, z) => {
    disposables.push(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };

  // plateau
  mk(new THREE.CylinderGeometry(15, 18, 2.6, 9), stoneDark, 0, 3.6, -95);

  const flags = [];
  const towers = [[-9, -92, 5.5], [-3.2, -99, 7.5], [3.4, -98, 6.5], [9, -91, 5]];
  towers.forEach(([x, z, h], i) => {
    mk(new THREE.CylinderGeometry(1.5, 1.9, 1.2, 7), stoneDark, x, 5.4, z);
    mk(new THREE.CylinderGeometry(1.1, 1.35, h, 7), stone, x, 5.8 + h / 2, z);
    mk(new THREE.ConeGeometry(1.5, 1.9, 7), roof, x, 6.6 + h, z);
    const pole = mk(new THREE.CylinderGeometry(0.045, 0.045, 1.6, 4), stoneDark, x, 8.2 + h, z);
    const flagGeo = new THREE.PlaneGeometry(0.9, 0.5);
    disposables.push(flagGeo);
    const flag = new THREE.Mesh(flagGeo, new THREE.MeshBasicMaterial({ color: '#e8b74a', side: THREE.DoubleSide }));
    disposables.push(flag.material);
    flag.position.set(x + 0.5, 8.6 + h, z);
    g.add(flag);
    flags.push({ flag, ph: i });
    // windows
    for (let w = 0; w < 3; w++) mk(new THREE.BoxGeometry(0.3, 0.45, 0.1), gold, x, 7 + w * (h / 3.2), z + 1.28);
  });

  // central monument
  mk(new THREE.BoxGeometry(3.4, 1, 3.4), stoneDark, 0, 5.4, -95);
  mk(new THREE.BoxGeometry(2.4, 3.6, 2.4), stone, 0, 7.6, -95);
  mk(new THREE.ConeGeometry(2, 2.4, 4), gold, 0, 10.7, -95);

  const update = (t) => flags.forEach(({ flag, ph }) => {
    flag.rotation.y = Math.sin(t * 3 + ph) * 0.35;
    flag.scale.y = 1 + Math.sin(t * 6 + ph) * 0.06;
  });
  return { group: g, update };
}

function buildHome(disposables) {
  const g = new THREE.Group();
  const wood = flatMat('#8a6242');
  const woodDark = flatMat('#5f4128');
  const warm = new THREE.MeshBasicMaterial({ color: '#ffd27a' });
  disposables.push(wood, woodDark, warm);
  const mk = (geo, mat, x, y, z, ry = 0) => {
    disposables.push(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    g.add(m);
    return m;
  };
  mk(new THREE.BoxGeometry(4.6, 2.6, 3.8), wood, 0, 1.3, -114);
  mk(new THREE.ConeGeometry(3.9, 2.2, 4), woodDark, 0, 3.7, -114, Math.PI / 4);
  mk(new THREE.BoxGeometry(0.9, 1.5, 0.1), woodDark, -1.1, 0.75, -112.05);           // door
  const win = mk(new THREE.BoxGeometry(1.0, 0.8, 0.1), warm, 0.9, 1.5, -112.05);      // glowing window
  mk(new THREE.CylinderGeometry(0.09, 0.09, 1.4, 5), woodDark, 1.9, 4.2, -114.8);     // chimney

  // campfire
  const fire = new THREE.PointLight('#ff9c50', 0, 9, 2);
  fire.position.set(2.6, 0.7, -110.5);
  g.add(fire);
  [[2.3, -110.3], [2.9, -110.7], [2.6, -110.2]].forEach(([x, z]) => mk(new THREE.CylinderGeometry(0.07, 0.07, 0.8, 4), woodDark, x, 0.15, z, rand() * 2).rotation.z = Math.PI / 2.3);
  const flame = mk(new THREE.ConeGeometry(0.22, 0.6, 5), warm, 2.6, 0.55, -110.5);

  const update = (t, dusk) => {
    fire.intensity = dusk * (1.6 + Math.sin(t * 11) * 0.5 + Math.sin(t * 23) * 0.25);
    flame.scale.setScalar(0.7 + dusk * (0.5 + Math.sin(t * 13) * 0.2));
    win.material.color.setHSL(0.11, 0.85, 0.35 + dusk * 0.35);
  };
  return { group: g, update };
}

/* ═══════════════ component ═══════════════ */

export default function Jungle() {
  const sectionRef = useRef(null);
  const canvasRef  = useRef(null);
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
    scene.fog = new THREE.FogExp2(SKY[0].fog, 0.016);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 260);
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
    for (let i = 0; i < 9; i++) {
      const c = new THREE.Group();
      for (let b = 0; b < 4; b++) {
        const m = new THREE.Mesh(cloudGeo, cloudMat);
        m.position.set(b * 1.6 - 2.4 + rand(), rand() * 0.5, rand() - 0.5);
        m.scale.set(1.5 + rand() * 1.6, 0.9 + rand() * 0.5, 1.1 + rand());
        c.add(m);
      }
      c.position.set((rand() - 0.5) * 160, 20 + rand() * 12, 25 - rand() * 165);
      scene.add(c);
      clouds.push({ c, sp: 0.3 + rand() * 0.5 });
    }

    // cast
    const actors = [];
    const addActor = (a) => { scene.add(a.group); (a.disposables || []).forEach((d) => disposables.push(d)); actors.push(a); };
    addActor(buildQuadruped({ body: [0.7, 0.55, 1.35], head: 0.5, legs: [0.07, 0.55], tail: [0.16, 0.8], ears: true, anchor: [3, 0, -6], radius: 2.4, speed: 0.55, scale: 1, colorBody: '#d97a3f', colorHead: '#e8934f', colorLeg: '#8a4b26' }));   // fox
  addActor(buildQuadruped({ body: [1.0, 0.75, 1.9], head: 0.62, legs: [0.1, 0.7], tail: [0.14, 1.0], ears: true, anchor: [-4, 0, -22], radius: 2.9, speed: 0.34, scale: 1.15, colorBody: '#d9903f', colorHead: '#e3a45c', colorLeg: '#96622a' })); // tiger
    addActor(buildSerpent({ anchor: [3.5, 0, -38] }));
    addActor(buildQuadruped({ body: [1.7, 1.5, 2.6], head: 1.0, legs: [0.22, 1.1], ears: false, trunk: 0.22, anchor: [-5, 0, -54], radius: 3.4, speed: 0.16, scale: 1.25, colorBody: '#9aa2ad', colorHead: '#8b939e', colorLeg: '#7d858f' }));    // elephant
    addActor(buildOwl({ anchor: [4, 0, -70] }));
    addActor(buildButterflies({ count: 6, area: [0, 0, -4] }));
    addActor(buildButterflies({ count: 4, area: [-2, 0, -110], colors: ['#ffe9a8'] }));
    const empire = buildEmpire(disposables); scene.add(empire.group); actors.push(empire);
    const home = buildHome(disposables); scene.add(home.group);

    // soft round sprite for all point clouds (default points are ugly squares)
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
      ffPos[i * 3] = (rand() - 0.5) * 26;
      ffPos[i * 3 + 1] = 0.5 + rand() * 5;
      ffPos[i * 3 + 2] = -100 - rand() * 26;
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
      stPos[i * 3] = (rand() - 0.5) * 220;
      stPos[i * 3 + 1] = 30 + rand() * 70;
      stPos[i * 3 + 2] = -40 - rand() * 140;
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
      return a.sunI + (b.sunI - a.sunI) * u; // returned for numeric props
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

      drive.prog += (drive.target - drive.prog) * 0.075; // cinematic damping
      const p = drive.prog;

      // sky / fog / light
      const sunI = lerpKeys(SKY, p, 'sky', scene.background);
      lerpKeys(SKY, p, 'fog', scene.fog.color);
      lerpKeys(SKY, p, 'sun', sun.color);
      sun.intensity = sunI;
      let i = 0; while (i < SKY.length - 2 && SKY[i + 1].p < p) i++;
      const u = THREE.MathUtils.clamp((p - SKY[i].p) / (SKY[i + 1].p - SKY[i].p), 0, 1);
      hemi.intensity = SKY[i].hemiI + (SKY[i + 1].hemiI - SKY[i].hemiI) * u;

      // sun arcs east → west across the journey
      const sa = Math.PI * (0.15 + p * 0.75);
      sunBall.position.set(Math.cos(sa) * 90, 12 + Math.sin(sa) * 55, camera.position.z - 110);
      glow.position.copy(sunBall.position);
      glow.material.opacity = Math.max(0.15, Math.sin(sa));
      sun.position.copy(sunBall.position).add(vA.set(0, 10, 40));

      // dusk elements
      const dusk = THREE.MathUtils.smoothstep(p, 0.82, 0.95);
      ffMat.opacity = dusk * (0.55 + Math.sin(t * 2.2) * 0.25);
      stMat.opacity = dusk * 0.9;
      home.update(t, dusk);

      // camera + mouse parallax
      camAt(p);
      camera.position.x += mouse.x * 0.5;
      camera.position.y += mouse.y * 0.3;
      camera.lookAt(look);

      actors.forEach((a) => a.update && a.update(t));
      clouds.forEach(({ c, sp }) => { c.position.x += Math.sin(t * 0.05 + sp) * 0.004 + 0.006 * sp; if (c.position.x > 110) c.position.x = -110; });

      // overlays — animate the inner card, never the positioned wrapper
      // (an inline transform on the wrapper would wipe out its centering classes)
      overlayRefs.current.forEach((el, idx) => {
        if (!el) return;
        const [a, b] = CHAPTERS[idx].range;
        const fade = 0.028;
        const alpha = THREE.MathUtils.clamp(Math.min((p - a) / fade, (b - p) / fade, 1), 0, 1);
        el.style.opacity = alpha.toFixed(3);
        const card = el.firstElementChild;
        if (card) card.style.transform = `translateY(${(1 - alpha) * 26}px)`;
        el.style.pointerEvents = CHAPTERS[idx].cta && alpha > 0.4 ? 'auto' : 'none';
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

    if (import.meta.env.DEV) window.__jungle = { drive, tick: loop, scene, camera, renderer }; // manual frame-stepping for automated checks
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

        {CHAPTERS.map((ch, i) => (
          <div key={i} ref={(el) => (overlayRefs.current[i] = el)}
            className={`absolute z-10 w-full px-6 ${
              ch.hint || ch.cta || !ch.stack
                ? 'left-1/2 -translate-x-1/2 text-center ' + (ch.hint ? 'top-[14%]' : 'bottom-[10%]')
                : i % 2 === 0
                  ? 'left-0 md:left-10 bottom-[9%] md:max-w-3xl'
                  : 'right-0 md:right-10 bottom-[9%] md:max-w-3xl md:ml-auto text-right'
            }`}
            style={{ opacity: 0, pointerEvents: 'none', willChange: 'opacity, transform' }}>
            <div className="inline-block rounded-3xl px-7 py-6 md:px-10 md:py-8 max-w-full"
              style={{ background: 'rgba(6, 18, 12, 0.58)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <p className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#ffe9a8] mb-2 md:mb-3">{ch.label}</p>
              <h2 className="display text-6xl md:text-[7rem] text-white leading-[0.9] mb-3 md:mb-4">{ch.title}</h2>

              {ch.plain && (
                <p className="text-lg md:text-2xl text-white/90 font-light leading-snug mb-4 md:mb-5">{ch.plain}</p>
              )}
              {ch.body && (
                <p className="text-sm md:text-base text-gray-200/80 leading-relaxed">{ch.body}</p>
              )}

              {ch.stack && (
                <div className={`flex flex-wrap gap-2 mb-3 ${i % 2 !== 0 ? 'justify-end' : ''}`}>
                  {ch.stack.map((s) => (
                    <span key={s}
                      className="px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold text-[#ffe9a8] border border-[#ffe9a8]/30 bg-[#ffe9a8]/10 whitespace-nowrap">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {ch.level && (
                <p className="text-[10px] md:text-xs tracking-[0.25em] uppercase text-white/50">✦ {ch.level}</p>
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
                  <a href="/shubham__dev__resume.pdf" download
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
