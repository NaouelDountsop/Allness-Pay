import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Send,
  Users,
  ArrowLeftRight,
  ShieldCheck,
  Headphones,
  CreditCard,
  BarChart3,
  Zap,
  Droplet,
  Wifi,
  Tv,
  GraduationCap,
  Grid2x2,
  Eye,
  Lock,
  ArrowRight,
} from 'lucide-react';

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">
      {/* ================= HEADER ================= */}
      <header className="bg-[#06251f] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img
              src="/afrilinkpay_logo1.svg"
              alt="AfriLink Pay"
              className="w-9 h-9 object-contain"
            />
            <span className="text-white font-bold text-[17px] tracking-tight">
              AfriLink<span className="text-[#f5a623]"> Pay</span>
            </span>
          </div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-8 text-[14px] text-white/80 font-medium">
            <a href="#accueil" className="hover:text-white transition-colors">
              Accueil
            </a>
            <a href="#apropos" className="hover:text-white transition-colors">
              À propos
            </a>
            <a href="#solutions" className="hover:text-white transition-colors">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="hover:text-white transition-colors">
              Tarifs
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          {/* Bouton Se connecter */}
          <div className="hidden md:block">
            <button
              onClick={() => navigate('/login')}
              className="h-10 px-5 rounded-lg bg-[#f5a623] text-white text-sm font-semibold hover:bg-[#e09415] transition-colors"
            >
              Se connecter
            </button>
          </div>

          {/* Burger mobile */}
          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="md:hidden text-white"
            aria-label="Menu"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu mobile */}
        {mobileNavOpen && (
          <div className="md:hidden px-4 pb-5 flex flex-col gap-4 text-sm text-white/80 border-t border-white/10 pt-4">
            <a href="#accueil" onClick={() => setMobileNavOpen(false)}>
              Accueil
            </a>
            <a href="#apropos" onClick={() => setMobileNavOpen(false)}>
              À propos
            </a>
            <a href="#solutions" onClick={() => setMobileNavOpen(false)}>
              Fonctionnalités
            </a>
            <a href="#tarifs" onClick={() => setMobileNavOpen(false)}>
              Tarifs
            </a>
            <a href="#contact" onClick={() => setMobileNavOpen(false)}>
              Contact
            </a>
            <button
              onClick={() => navigate('/login')}
              className="h-11 rounded-lg bg-[#f5a623] text-white text-sm font-semibold"
            >
              Se connecter
            </button>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <section
        id="accueil"
        className="relative bg-[#06251f] overflow-hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at 70% 40%, rgba(20,80,70,0.4) 0%, transparent 60%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-14 pb-28 sm:pt-16 sm:pb-32 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          {/* Texte gauche */}
          <div className="relative z-10">
            <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-white leading-[1.15] mb-5">
              Gérez votre patrimoine
              <br />
              global <span className="text-[#f5a623]">en toute</span>
              <br />
              <span className="text-[#f5a623]">simplicité.</span>
            </h1>

            <p className="text-[15px] text-white/70 leading-relaxed mb-8 max-w-[420px]">
              Envoyez de l'argent, payez vos services et gérez vos tontines en toute sécurité,
              partout dans le monde avec AfriLink Pay.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-7">
              <button
                onClick={() => navigate('/signup')}
                className="h-12 px-7 rounded-lg bg-[#1a8a4c] text-white text-[15px] font-semibold hover:bg-[#167a43] transition-colors"
              >
                Créer un compte
              </button>
              <button
                onClick={() => navigate('/login')}
                className="h-12 px-7 rounded-lg border-2 border-[#f5a623] text-[#f5a623] text-[15px] font-semibold hover:bg-white/5 transition-colors"
              >
                Découvrir
              </button>
            </div>

            <div className="flex items-center gap-2 text-white/70 text-[13px]">
              <ShieldCheck className="w-4 h-4 text-[#1a8a4c]" />
              Sécurisé, rapide et fiable
            </div>
          </div>

          {/* Zone image + éléments flottants */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Image principale */}
            <img
              src="/hero-person.png"
              alt="Utilisateur AfriLink Pay"
              className="w-full max-w-[420px] lg:max-w-[480px] object-contain relative z-10"
            />

            {/* Carte Solde du wallet */}
            <div className="absolute top-0 right-0 sm:right-2 lg:-right-2 w-[210px] rounded-2xl bg-white shadow-xl p-4 z-20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-gray-400 font-medium">Solde du wallet</span>
                <Eye className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <p className="text-[20px] font-bold text-[#06251f] mb-3">42.850,00 €</p>
              <div className="border-t border-gray-100 pt-3 space-y-2.5">
                <div className="flex items-center gap-2.5 text-[12px] text-gray-600">
                  <span className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#1a8a4c]" />
                  </span>
                  Transfert d'argent
                </div>
                <div className="flex items-center gap-2.5 text-[12px] text-gray-600">
                  <span className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <CreditCard className="w-3.5 h-3.5 text-[#f5a623]" />
                  </span>
                  Paiement de services
                </div>
              </div>
            </div>

            {/* Badge Transactions sécurisées */}
            <div className="absolute bottom-6 right-0 sm:right-4 lg:right-0 flex items-center gap-3 bg-[#0a2e28]/95 border border-white/10 rounded-xl px-4 py-3 z-20 shadow-lg">
              <span className="w-9 h-9 rounded-full bg-[#f5a623] flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-white" />
              </span>
              <div>
                <p className="text-white text-[13px] font-semibold leading-none mb-1">
                  Transactions sécurisées
                </p>
                <p className="text-white/50 text-[11px] leading-none">
                  Chiffrement de bout en bout
                </p>
              </div>
            </div>

            {/* Trajectoire avion en papier (décorative) */}
            <div className="absolute top-[18%] left-[15%] sm:left-[22%] z-0 pointer-events-none">
              <Send className="w-5 h-5 text-[#f5a623] rotate-[-25deg] opacity-90" />
              <svg className="absolute top-3 left-4 w-32 h-20" viewBox="0 0 120 80" fill="none">
                <path
                  d="M2 10 C30 5, 50 40, 80 35 S110 10, 118 20"
                  stroke="#f5a623"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BANDEAU STATS ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-6 sm:px-10 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
          <StatCard icon={Users} value="500K+" label="Utilisateurs actifs" />
          <StatCard icon={ArrowLeftRight} value="2M+" label="Transactions réussies" />
          <StatCard icon={ShieldCheck} value="100%" label="Sécurité" />
          <StatCard icon={Headphones} value="24/7" label="Support client" />
        </div>
      </section>

      {/* ================= TOUT CE DONT VOUS AVEZ BESOIN ================= */}
      <section
        id="solutions"
        className="max-w-7xl mx-auto px-4 sm:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20"
      >
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-[26px] sm:text-[32px] font-bold text-[#06251f] mb-3">
            Tout ce dont vous avez besoin <span className="text-[#1a8a4c]">au même endroit</span>
          </h2>
          <p className="text-[15px] text-gray-500">
            Une plateforme complète pour simplifier votre quotidien financier.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          <FeatureCard
            icon={Send}
            title="Transfert d'argent"
            description="Envoyez et recevez de l'argent rapidement, localement ou à l'international."
          />
          <FeatureCard
            icon={Users}
            title="Tontines digitales"
            description="Créez ou rejoignez une tontine en quelques clics et gérez vos cotisations facilement."
          />
          <FeatureCard
            icon={CreditCard}
            title="Paiement de services"
            description="Payez vos factures (électricité, eau, internet, TV...) et bien plus encore."
          />
          <FeatureCard
            icon={BarChart3}
            title="Gestion de portefeuille"
            description="Suivez vos transactions et gérez votre argent en toute simplicité."
          />
        </div>

        {/* Bloc Tontines Digitales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
            <img
              src="/dashboard-mockup.png"
              alt="Aperçu du tableau de bord AfriLink Pay"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative">
            <p className="text-[#f5a623] text-[14px] font-semibold mb-2">Tontines Digitales</p>
            <h3 className="text-[24px] sm:text-[28px] font-bold text-[#06251f] mb-4 leading-snug">
              Épargnez à plusieurs, atteignez vos objectifs plus vite.
            </h3>
            <p className="text-[15px] text-gray-500 leading-relaxed mb-7 max-w-md">
              Notre système de tontines digitales sécurisé et transparent vous permet de bâtir votre
              avenir ensemble.
            </p>
            <button className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#06251f] text-white text-[14px] font-semibold hover:bg-[#0a352c] transition-colors">
              En savoir plus
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Illustration sac d'argent */}
            <img
              src="/piggy-bank.png"
              alt=""
              className="hidden sm:block absolute -bottom-4 -right-4 lg:right-0 w-32 h-32 object-contain"
            />
          </div>
        </div>
      </section>

      {/* ================= PAYEZ VOS SERVICES ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-20 sm:pb-24">
        <h3 className="text-center text-[20px] sm:text-[22px] font-bold text-[#06251f] mb-9">
          Payez vos services en quelques clics
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          <ServiceIcon icon={Zap} label="Électricité" />
          <ServiceIcon icon={Droplet} label="Eau" />
          <ServiceIcon icon={Wifi} label="Internet" />
          <ServiceIcon icon={Tv} label="Télévision" />
          <ServiceIcon icon={ShieldCheck} label="Assurance" />
          <ServiceIcon icon={GraduationCap} label="Éducation" />
          <ServiceIcon icon={Grid2x2} label="Plus encore" />
        </div>
      </section>

      {/* ================= ILS NOUS FONT CONFIANCE ================= */}
      <section className="bg-gray-50 py-12 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <p className="text-[17px] font-bold text-[#06251f] mb-7">Ils nous font confiance</p>
          <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap text-[42px] sm:text-[48px]">
            <span role="img" aria-label="Canada">
              🇨🇦
            </span>
            <span role="img" aria-label="Cameroun">
              🇨🇲
            </span>
            <span role="img" aria-label="Sénégal">
              🇸🇳
            </span>
            <span role="img" aria-label="Côte d'Ivoire">
              🇨🇮
            </span>
            <span role="img" aria-label="France">
              🇫🇷
            </span>
            <span role="img" aria-label="États-Unis">
              🇺🇸
            </span>
          </div>
        </div>
      </section>

      {/* ================= CTA FINALE ================= */}
      <section id="tarifs" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        <div className="rounded-2xl bg-[#06251f] px-6 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <span className="w-14 h-14 rounded-full bg-[#f5a623] flex items-center justify-center shrink-0">
            <Send className="w-6 h-6 text-white" />
          </span>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-[22px] sm:text-[26px] font-bold text-white mb-2">
              Prêt à transformer votre avenir financier ?
            </h2>
            <p className="text-[14px] text-white/60 max-w-lg">
              Rejoignez AfriLink Pay aujourd'hui et commencez à gérer votre argent avec plus de
              liberté et d'efficacité.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => navigate('/signup')}
              className="h-11 px-6 rounded-lg bg-[#1a8a4c] text-white text-[14px] font-semibold hover:bg-[#167a43] transition-colors"
            >
              Créer un compte
            </button>
            <button className="h-11 px-6 rounded-lg border-2 border-[#f5a623] text-[#f5a623] text-[14px] font-semibold hover:bg-white/5 transition-colors">
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer id="contact" className="bg-[#06251f] text-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Logo + description */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/afrilinkpay_logo1.svg"
                alt="AfriLink Pay"
                className="w-8 h-8 object-contain"
              />
              <span className="text-white font-bold text-[15px]">
                AfriLink<span className="text-[#f5a623]"> Pay</span>
              </span>
            </div>
            <p className="text-[12px] leading-relaxed max-w-[200px]">
              La plateforme financière pensée pour la diaspora africaine.
            </p>
          </div>

          <FooterColumn
            title="Liens utiles"
            links={['À propos', 'Fonctionnalités', 'Tarifs', 'Contact']}
          />
          <FooterColumn
            title="Légal"
            links={["Conditions d'utilisation", 'Politique de confidentialité', 'Sécurité']}
          />

          {/* Réseaux sociaux */}
          <div>
            <p className="text-white text-[13px] font-semibold mb-4">Suivez-nous</p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <FacebookIcon className="w-4 h-4 text-white" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <XIcon className="w-4 h-4 text-white" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <InstagramIcon className="w-4 h-4 text-white" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <LinkedinIcon className="w-4 h-4 text-white" />
              </a>
              <a
                href="https://wa.me/237600000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <WhatsappIcon className="w-4 h-4 text-white" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 text-center text-[12px]">
            <p>© 2024 AfriLink Pay. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ================= COMPOSANTS RÉUTILISABLES ================= */

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#1a8a4c]" />
      </span>
      <div>
        <p className="text-[18px] font-bold text-[#06251f] leading-none mb-1">{value}</p>
        <p className="text-[12px] text-gray-500 leading-none">{label}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Send;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
      <span className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-[#1a8a4c]" />
      </span>
      <h3 className="text-[15px] font-semibold text-[#06251f] mb-2">{title}</h3>
      <p className="text-[13px] text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function ServiceIcon({ icon: Icon, label }: { icon: typeof Zap; label: string }) {
  return (
    <div className="rounded-xl border border-gray-100 shadow-sm py-5 px-2 flex flex-col items-center gap-2.5 hover:shadow-md transition-shadow">
      <Icon className="w-5 h-5 text-[#06251f]" />
      <span className="text-[12px] text-gray-600 font-medium text-center">{label}</span>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-white text-[13px] font-semibold mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="text-[13px] hover:text-white transition-colors">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
