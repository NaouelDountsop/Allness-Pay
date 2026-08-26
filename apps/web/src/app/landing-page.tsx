import Navbar from '@/components/landing/navbar';
import Hero from '@/components/landing/hero';
import StatsBar from '@/components/landing/stats-bar';
import Features from '@/components/landing/features';
import Tontines from '@/components/landing/tontines';
import Services from '@/components/landing/services';
import Trust from '@/components/landing/trust';
import CTA from '@/components/landing/cta';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="bg-white dark:bg-[#071418] text-foreground">
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Features />
        <Tontines />
        <Services />
        <Trust />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}
