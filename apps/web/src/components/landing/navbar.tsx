import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Accueil', href: '#accueil' },
  { label: 'Fonctionnalités', href: '#fonctionnalites' },
  { label: 'Tarifs', href: '#tontines' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkBg, setIsDarkBg] = useState(true);

  const checkBg = useCallback(() => {
    const heroEl = document.getElementById('accueil');
    if (!heroEl) {
      setIsDarkBg(true);
      return;
    }
    const heroBottom = heroEl.getBoundingClientRect().bottom;
    const docH = document.documentElement.scrollHeight;
    const winH = window.innerHeight;
    const atBottom = window.scrollY + winH >= docH - 400;
    setIsDarkBg(heroBottom > 80 || atBottom);
  }, []);

  useEffect(() => {
    checkBg();
    window.addEventListener('scroll', checkBg, { passive: true });
    window.addEventListener('resize', checkBg);
    return () => {
      window.removeEventListener('scroll', checkBg);
      window.removeEventListener('resize', checkBg);
    };
  }, [checkBg]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  const headerBg = isDarkBg
    ? 'linear-gradient(160deg, #0f2e33 0%, #14382e 40%, #0f2e33 100%)'
    : '#ffffff';
  const linkColor = isDarkBg
    ? 'text-white/85 hover:text-allness-orange'
    : 'text-allness-green hover:text-allness-orange';
  const btnBg = isDarkBg
    ? 'bg-allness-orange text-allness-dark hover:bg-allness-orange/90'
    : 'bg-allness-dark text-white hover:bg-allness-darker';
  const logoSrc = isDarkBg ? '/allnesspay_logo1.png' : '/allnesspay_logo1.png';
  const hamburgerColor = isDarkBg ? 'text-white' : 'text-allness-dark';

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50 shadow-md transition-colors duration-300"
        style={{ background: headerBg }}
      >
        <nav className="mx-auto max-w-7xl px-5 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
          <a href="#accueil" className="flex items-center gap-0 group shrink-0">
            <img
              src={logoSrc}
              alt="Allness Pay"
              className="h-10 lg:h-12 w-auto transition-all duration-300"
            />
            <p className={`text-sm font-medium transition-colors duration-300 hover:scale-105 ${linkColor}`}>
              Allness <span className="text-allness-orange">Pay</span>{' '}
            </p>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${linkColor}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <a
              href="/login"
              className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 ${btnBg}`}
            >
              Se connecter
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className={`md:hidden p-2 -mr-2 transition-colors duration-300 ${hamburgerColor}`}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-allness-dark flex flex-col">
          <div className="h-16 px-5 flex items-center justify-between">
            <span className="font-heading font-extrabold text-lg text-white">
              Allness<span className="text-allness-orange"> Pay</span>
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-white"
              aria-label="Fermer le menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center px-6 gap-1">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-heading font-bold text-3xl py-3 text-white animate-fade-up hover:text-allness-orange transition-colors"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-6 bg-allness-orange text-allness-dark text-center font-semibold px-6 py-4 rounded-full hover:bg-allness-orange/90 transition-colors"
            >
              Se connecter
            </a>
          </div>
        </div>
      )}
    </>
  );
}
