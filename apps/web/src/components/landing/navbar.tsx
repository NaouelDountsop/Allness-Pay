import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Accueil", href: "#accueil" },
  { label: "À propos", href: "#a-propos" },
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Tarifs", href: "#tontines" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-5 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
          <a href="#accueil" className="flex items-center gap-0 group shrink-0">
            {!scrolled ? (
              <img src="/afrilinkpay_logo1.svg" alt="AfriLink Pay" className="h-10 lg:h-12 w-auto transition-all duration-500" />
            ) : (
              <img src="/afrilinkpay_logo2.svg" alt="AfriLink Pay" className="h-10 lg:h-12 w-auto transition-all duration-500" />
            )}
            <p className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  scrolled
                    ? "text-afrilink-dark/70 hover:text-afrilink-orange"
                    : "text-white/85 hover:text-afrilink-orange"
                }`}>Afrilink <span className="text-afrilink-orange">Pay</span> </p>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  scrolled
                    ? "text-afrilink-dark/70 hover:text-afrilink-orange"
                    : "text-white/85 hover:text-afrilink-orange"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <a
              href="/login"
              className={`text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 ${
                scrolled
                  ? "bg-afrilink-dark text-white hover:bg-afrilink-darker"
                  : "bg-afrilink-orange text-afrilink-dark hover:bg-afrilink-orange/90"
              }`}
            >
              Se connecter
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className={`md:hidden p-2 -mr-2 transition-colors duration-500 ${
              scrolled ? "text-afrilink-dark" : "text-white"
            }`}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-afrilink-dark flex flex-col">
          <div className="h-16 px-5 flex items-center justify-between">
            <span className="font-heading font-extrabold text-lg text-white">
              AfriLink<span className="text-afrilink-orange"> Pay</span>
            </span>
            <button onClick={() => setMenuOpen(false)} className="text-white" aria-label="Fermer le menu">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center px-6 gap-1">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-heading font-bold text-3xl py-3 text-white animate-fade-up hover:text-afrilink-orange transition-colors"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="mt-6 bg-afrilink-orange text-afrilink-dark text-center font-semibold px-6 py-4 rounded-full hover:bg-afrilink-orange/90 transition-colors"
            >
              Se connecter
            </a>
          </div>
        </div>
      )}
    </>
  );
}
