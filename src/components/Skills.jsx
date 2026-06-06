import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Parallax } from 'react-scroll-parallax';

gsap.registerPlugin(ScrollTrigger);

const skillGroups = [
  { category: 'Languages',      skills: ['JavaScript', 'TypeScript', 'Rust', 'Java'] },
  { category: 'Frontend',       skills: ['React', 'Next.js', 'Redux', 'RTK Query', 'TanStack Query', 'Tailwind CSS', 'HTML/CSS'] },
  { category: 'Backend & APIs', skills: ['Node.js', 'Express.js', 'RESTful APIs', 'GraphQL', 'WebSockets'] },
  { category: 'Databases',      skills: ['PostgreSQL', 'MongoDB', 'Supabase', 'Drizzle ORM'] },
  { category: 'Cloud & DevOps', skills: ['AWS', 'Docker', 'Git', 'GitHub Actions', 'CI/CD'] },
];

export default function Skills() {
  const sectionRef  = useRef(null);
  const blobARef    = useRef(null);
  const blobBRef    = useRef(null);
  const triRef      = useRef(null);
  const headingRef  = useRef(null);
  const cardsRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(blobARef.current, { y: -100, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 2.5 } });
      gsap.to(blobBRef.current, { y: -160, x: -30, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 } });
      gsap.to(triRef.current, { y: -200, rotation: 120, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });

      gsap.fromTo(headingRef.current, { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%' } });

      Array.from(cardsRef.current.children).forEach((card, i) => {
        gsap.fromTo(card, { y: 60 + i * 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' }, delay: i * 0.05 });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="skills" className="panel relative py-32 bg-[#0d0d0d] overflow-hidden" style={{ zIndex: 3 }}>
      <div ref={blobARef} className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/3 blur-3xl pointer-events-none" />
      <div ref={blobBRef} className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/3 blur-3xl pointer-events-none" />
      <div ref={triRef}   className="absolute top-1/3 right-16 pointer-events-none opacity-10">
        <div className="w-20 h-20 border-4 border-white rotate-12" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <Parallax translateY={[30, -10]}>
          <div ref={headingRef} className="text-center mb-16">
            <p className="section-label mb-3">What I Work With</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Technical <span className="text-gray-600">Skills</span></h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">A curated stack of tools I've mastered through real-world projects and production experience.</p>
          </div>
        </Parallax>

        <div ref={cardsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillGroups.map(({ category, skills }, i) => {
            const yValues = [[20, -5], [25, -3], [22, -7], [18, -4], [28, -6]];
            const opacityValues = [[0.7, 1], [0.65, 1], [0.72, 1], [0.68, 1], [0.7, 1]];
            return (
              <Parallax key={category} translateY={yValues[i]} opacity={opacityValues[i]}>
                <div className="card-hover glass-card rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="font-bold text-gray-200">{category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 text-gray-400 border border-white/10">{s}</span>
                    ))}
                  </div>
                </div>
              </Parallax>
            );
          })}
        </div>
      </div>
    </section>
  );
}
