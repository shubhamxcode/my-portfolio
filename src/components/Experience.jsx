import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const experiences = [
  {
    role: 'Full Stack Developer', company: 'AdsFlicker',
    period: 'Apr 2025 – Apr 2026', type: 'Full-time · Remote',
    points: [
      'Developed and optimized core features for AdsFlicker\'s advertising platform, enabling advertisers and publishers to manage campaigns using modern web technologies.',
      'Built scalable full-stack modules for campaign management, tracking, and reporting supporting ad models such as CPA, CPC, and CPM.',
      'Designed responsive dashboards and dynamic UI components to monitor traffic, conversions, and campaign performance in real time.',
    ],
    stack: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  },
  {
    role: 'Full Stack Intern', company: 'InfiniSync',
    period: 'Oct 2024 – Mar 2025', type: 'Intern · Remote',
    points: [
      'Built full-stack features using React, TypeScript, and Node.js, integrating RESTful APIs and managing end-to-end data flow.',
      'Designed and implemented backend API endpoints and database schemas, collaborating with the team to deliver scalable features.',
      'Improved performance by optimizing state management, refactoring UI components, and implementing real-time features using WebSockets.',
    ],
    stack: ['React', 'TypeScript', 'Node.js', 'WebSockets'],
  },
  {
    role: 'Full Stack Developer', company: 'AshnaAI',
    period: 'Apr 2024 – Sep 2024', type: 'Internship · Remote',
    points: [
      'Developed AshnaAI\'s AI-powered platform using Next.js, TypeScript, and Tailwind CSS with focus on performance and responsiveness.',
      'Built dynamic UI components and integrated RESTful APIs to enhance user interaction and scalability.',
      'Collaborated with backend services to implement scalable features and ensure seamless data flow across the platform.',
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'RESTful APIs'],
  },
];

export default function Experience() {
  const sectionRef = useRef(null);
  const blobRef    = useRef(null);
  const ringRef    = useRef(null);
  const dotsRef    = useRef(null);
  const lineRef    = useRef(null);
  const itemsRef   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(blobRef.current, { y: -120, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 2 } });
      gsap.to(ringRef.current, { y: -160, rotation: -60, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
      gsap.to(dotsRef.current, { y: -220, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.7 } });

      gsap.fromTo(lineRef.current, { scaleY: 0, transformOrigin: 'top center' },
        { scaleY: 1, duration: 2, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' } });

      itemsRef.current.forEach((item, i) => {
        if (!item) return;
        gsap.fromTo(item, { x: i % 2 === 0 ? -70 : 70, opacity: 0, y: 20 },
          { x: 0, y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: item, start: 'top 82%' } });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="experience" className="relative py-32 bg-[#111111] overflow-hidden" style={{ zIndex: 4 }}>
      <div ref={blobRef}  className="absolute -top-20 -right-40 w-[550px] h-[550px] rounded-full bg-white/3 blur-3xl pointer-events-none" />
      <div ref={ringRef}  className="absolute bottom-40 -left-16 w-48 h-48 rounded-full border-[28px] border-white/5 pointer-events-none" />
      <div ref={dotsRef}  className="absolute top-1/2 right-12 pointer-events-none opacity-20 grid grid-cols-5 gap-2.5">
        {Array.from({ length: 25 }).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40" />)}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Where I've Worked</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Work <span className="text-gray-600">Experience</span></h2>
        </div>

        <div className="relative">
          <div ref={lineRef} className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-white/20 to-transparent hidden md:block" />

          <div className="space-y-12">
            {experiences.map((exp, i) => (
              <div key={exp.company} ref={(el) => (itemsRef.current[i] = el)}
                className={`relative flex flex-col md:flex-row gap-8 ${i % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="md:w-[calc(50%-24px)] glass-card card-hover rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                      <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 bg-white/10 text-gray-300 border border-white/10">{exp.company}</span>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs font-semibold text-gray-400">{exp.period}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{exp.type}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {exp.points.map((pt, j) => (
                      <li key={j} className="flex gap-2 text-sm text-gray-500 leading-relaxed">
                        <span className="text-gray-700 shrink-0 mt-0.5">▸</span>{pt}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.stack.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400 font-medium border border-white/10">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-8 z-10">
                  <div className="w-4 h-4 rounded-full bg-white shadow-lg shadow-white/20 ring-4 ring-[#111111]" />
                </div>
                <div className="hidden md:block md:w-[calc(50%-24px)]" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 glass-card rounded-2xl p-8 border border-white/5">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-4-3.5l4 2 4-2" />
              </svg>
            </div>
            <div>
              <p className="section-label mb-1">Education</p>
              <h3 className="text-xl font-bold text-white">Noida Institute of Engineering and Technology (AKTU)</h3>
              <p className="text-gray-500 mt-1">Bachelor of Technology in Information Technology</p>
              <p className="text-sm text-gray-400 font-medium mt-1">Oct 2023 – Jul 2027 · Greater Noida, UP</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
