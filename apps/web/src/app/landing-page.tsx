import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {  Menu, X, Send, Globe2, Wallet } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="w-full min-h-screen bg-white overflow-x-hidden">
      {/* HEADER — fond blanc */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-4">
          <div className="flex items-center gap-2">
            <img src="/afrilinkpay_logo2.svg" alt="" className="w-7 h-7 object-contain" />
            <span className="text-afrilink-dark font-bold text-sm">
              Afrilink<span className="text-afrilink-orange">Pay</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#accueil" className="hover:text-afrilink-dark transition-colors">Accueil</a>
            <a href="#produits" className="hover:text-afrilink-dark transition-colors">Produits</a>
            <a href="#tarifs" className="hover:text-afrilink-dark transition-colors">Tarifs</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="h-9 px-4 rounded-lg border border-afrilink-orange text-afrilink-orange text-sm font-medium hover:bg-orange-50 transition-colors"
            >
              Se connecter
            </button>
          </div>

          <button
            onClick={() => setMobileNavOpen((v) => !v)}
            className="md:hidden text-afrilink-dark"
            aria-label="Menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden px-4 pb-5 flex flex-col gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
            <a href="#accueil" onClick={() => setMobileNavOpen(false)}>Accueil</a>
            <a href="#produits" onClick={() => setMobileNavOpen(false)}>Produits</a>
            <a href="#tarifs" onClick={() => setMobileNavOpen(false)}>Tarifs</a>
            <button
              onClick={() => navigate("/login")}
              className="h-10 rounded-lg border border-afrilink-orange text-afrilink-orange text-sm font-medium"
            >
              Se connecter
            </button>
          </div>
        )}
      </header>

      {/* HERO — fond sombre */}
      <section id="accueil" className="bg-gradient-to-b from-afrilink-dark to-afrilink-darker">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-20 sm:pt-16 sm:pb-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
              Gérez votre patrimoine{" "}
              <span className="text-afrilink-orange">global</span> en toute
              simplicité
            </h1>

            <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-8 max-w-md">
              De la gestion d'actifs à vos transferts internationaux, profitez de
              plusieurs services financiers réunis dans une seule plateforme.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="h-11 px-6 rounded-lg border border-afrilink-orange text-afrilink-orange text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Créer un compte
              </button>
              <button
                onClick={() => navigate("/login")}
                className="h-11 px-6 rounded-lg border border-afrilink-orange text-afrilink-orange text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Se connecter
              </button>
            </div>
          </div>

          {/* Image de la personne — plus d'espace, carte non superposée au visage */}
          <div className="relative flex justify-center lg:justify-end">
            <img
              src="/hero-person.png"
              alt="Utilisateur AfrilinkPay"
              className="w-full max-w-md lg:max-w-lg object-contain"
            />

            <div className="absolute top-0 right-0 sm:right-4 z-20 w-44 sm:w-52 rounded-xl bg-white shadow-xl p-4">
              <p className="text-[10px] text-gray-400 mb-1">Solde disponible</p>
              <p className="text-lg sm:text-xl font-bold text-afrilink-dark">
                43 960,00 <span className="text-xs font-normal text-gray-400">€</span>
              </p>
              <div className="h-1 w-full rounded-full bg-gray-100 mt-3 overflow-hidden">
                <div className="h-full w-2/3 rounded-full bg-afrilink-green" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION "TOUT CE DONT VOUS AVEZ BESOIN" */}
      <section id="produits" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-afrilink-dark mb-3">
            Tout ce dont vous avez besoin au même endroit
          </h2>
          <p className="text-sm text-gray-500">
            Une suite complète d'outils financiers pensée pour la diaspora et les
            familles connectées à l'international.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Mockup EN DESSOUS du texte, pas à côté */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h3 className="text-lg font-semibold text-afrilink-dark mb-2">
              Gestion de Patrimoine Multi-devises
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Suivez, convertissez et faites fructifier vos avoirs en XAF, EUR,
              USD et CAD depuis un seul tableau de bord, en temps réel.
            </p>
            <img
              src="/dashboard-mockup.png"
              alt="Aperçu du tableau de bord AfrilinkPay"
              className="w-full rounded-xl object-cover"
            />
          </div>

          {/* Carte Tontines avec image piggy */}
          <div className="rounded-2xl bg-afrilink-dark text-white p-6 sm:p-8 flex flex-col">
            <img
              src="/piggy-bank.png"
              alt=""
              className="w-16 h-16 object-contain mb-4"
            />
            <h3 className="text-base font-semibold mb-2">Tontines Digitales</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Créez ou rejoignez des cercles d'épargne rotatifs, gérés
              automatiquement et en toute transparence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <FeatureCard
            icon={Send}
            title="Envoi d'argent instantané"
            description="Transférez des fonds vers l'Afrique en quelques secondes, à taux préférentiel."
          />
          <FeatureCard
            icon={Globe2}
            title="Transferts Internationaux"
            description="Envoyez et recevez depuis le Canada, la France ou les États-Unis sans friction."
          />
          <FeatureCard
            icon={Wallet}
            title="Épargne Collective"
            description="Bâtissez des projets communs avec votre famille ou votre communauté."
          />
        </div>
      </section>

      {/* SECTION CONFIANCE */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <p className="text-xs font-medium text-gray-400 tracking-wide mb-6">
            ILS NOUS FONT CONFIANCE
          </p>
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            <span className="text-3xl sm:text-4xl" role="img" aria-label="Canada">🇨🇦</span>
            <span className="text-3xl sm:text-4xl" role="img" aria-label="Cameroun">🇨🇲</span>
            <span className="text-3xl sm:text-4xl" role="img" aria-label="Cameroun">🇨🇲</span>
            <span className="text-3xl sm:text-4xl" role="img" aria-label="Canada">🇨🇦</span>
          </div>
        </div>
      </section>

      {/* CTA FINALE */}
      <section id="tarifs" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <div className="rounded-2xl bg-gradient-to-br from-afrilink-dark to-afrilink-darker px-6 sm:px-12 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Prêt à transformer votre avenir financier ?
          </h2>
          <p className="text-sm text-white/60 max-w-md mx-auto mb-8">
            Rejoignez des milliers de familles qui gèrent déjà leur patrimoine
            international avec AfrilinkPay.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="h-11 px-6 rounded-lg border border-afrilink-orange text-afrilink-orange text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Créer un compte
            </button>
            <button className="h-11 px-6 rounded-lg border border-afrilink-orange text-afrilink-orange text-sm font-medium hover:bg-white/5 transition-colors">
              Parler à un conseiller
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-afrilink-dark text-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/afrilinkpay_logo2.svg" alt="" className="w-6 h-6 object-contain" />
              <span className="text-white font-bold text-sm">
                Afrilink<span className="text-afrilink-orange">Pay</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed">
              La plateforme financière pensée pour la diaspora africaine.
            </p>
          </div>

          <FooterColumn
            title="Produit"
            links={["Envoi d'argent", "Portefeuille", "Tontines", "Paiements"]}
          />
          <FooterColumn
            title="Ressources"
            links={["Centre d'aide", "Blog", "Statut du service", "API"]}
          />
          <FooterColumn
            title="Légal"
            links={["Conditions d'utilisation", "Politique de confidentialité", "Sécurité"]}
          />
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© 2026 AfrilinkPay. Tous droits réservés.</p>

          </div>
        </div>
      </footer>
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
    <div className="rounded-2xl border border-gray-100 shadow-sm p-6">
      <span className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-afrilink-green" />
      </span>
      <h3 className="text-sm font-semibold text-afrilink-dark mb-2">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="text-white text-xs font-semibold mb-3">{title}</p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="text-xs hover:text-white transition-colors">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
