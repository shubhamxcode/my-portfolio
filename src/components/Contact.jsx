import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EmailIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const PhoneIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);
const GitHubIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const contactLinks = [
  { label: 'Email',    value: 'shubh.varshneycode@gmail.com',    href: 'mailto:shubh.varshneycode@gmail.com', Icon: EmailIcon },
  { label: 'Phone',    value: '+91 7417426494',                  href: 'tel:+917417426494',                  Icon: PhoneIcon },
  { label: 'GitHub',   value: 'github.com/shubhamvarshney',      href: 'https://github.com',                 Icon: GitHubIcon },
  { label: 'LinkedIn', value: 'linkedin.com/in/shubhamvarshney', href: 'https://linkedin.com',               Icon: LinkedInIcon },
];

export default function Contact() {
  const sectionRef = useRef(null);
  const blob1Ref   = useRef(null);
  const blob2Ref   = useRef(null);
  const squareRef  = useRef(null);
  const headingRef = useRef(null);
  const cardsRef   = useRef(null);
  const ctaRef     = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(blob1Ref.current, { y: -100, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 2.5 } });
      gsap.to(blob2Ref.current, { y: -160, x: 20, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1.5 } });
      gsap.to(squareRef.current, { y: -200, rotation: 180, ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });

      gsap.fromTo(headingRef.current, { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 80%' } });
      gsap.fromTo(cardsRef.current.children, { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 82%' } });
      gsap.fromTo(ctaRef.current, { y: 40, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' } });

      gsap.to(blob1Ref.current, { y: '+=20', duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="panel relative py-32 bg-[#111111] overflow-hidden" style={{ zIndex: 6 }}>
      <div ref={blob1Ref}  className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/3 blur-3xl pointer-events-none" />
      <div ref={blob2Ref}  className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/3 blur-3xl pointer-events-none" />
      <div ref={squareRef} className="absolute top-1/3 left-12 w-16 h-16 border-4 border-white/10 rotate-12 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div ref={headingRef} className="text-center mb-16">
          <p className="section-label mb-3">Get In Touch</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">
            Let's <span className="text-gray-600">Work Together</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            Open to full-time roles, freelance projects, and interesting collaborations. I typically respond within 24 hours.
          </p>
        </div>

        <div ref={cardsRef} className="grid sm:grid-cols-2 gap-4 mb-12">
          {contactLinks.map(({ label, value, href, Icon }) => (
            <a key={label} href={href}
              target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
              className="glass-card card-hover rounded-2xl p-5 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0"><Icon /></div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors truncate">{value}</p>
              </div>
              <svg className="w-4 h-4 text-gray-700 group-hover:text-gray-300 ml-auto shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          ))}
        </div>

        <div ref={ctaRef} className="glass-card rounded-3xl p-10 text-center border border-white/5">
          <h3 className="text-2xl font-bold text-white mb-2">Open to Opportunities</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Whether it's a full-time role or an exciting side project, I'd love to hear about it.</p>
          <a href="mailto:shubh.varshneycode@gmail.com"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-black rounded-full bg-white hover:bg-gray-200 shadow-lg shadow-white/10 transition-all duration-300 hover:-translate-y-0.5">
            Say Hello
          </a>
        </div>
      </div>
    </section>
  );
}
