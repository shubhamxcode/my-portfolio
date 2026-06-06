export default function Footer() {
  return (
    <footer className="panel py-8 bg-black border-t border-white/5" style={{ zIndex: 7 }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} <span className="font-semibold text-gray-400">Shubham Varshney</span>. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {[{ label: 'GitHub', href: 'https://github.com/shubhamxcode' },
            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/shubhamxcode/' },
            { label: 'X', href: 'https://x.com/shubhamXcode' }].map(({ label, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-white transition-colors font-medium">{label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
