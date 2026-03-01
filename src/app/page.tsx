import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { Pricing } from '@/components/pricing';
import { FAQ } from '@/components/faq';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <main className="overflow-hidden">
      {/* Background mesh */}
      <div className="gradient-mesh" />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Features Section */}
      <section id="features">
        <Features />
      </section>

      {/* Social Proof Section */}
      <section className="relative py-16 bg-dark border-y border-dark-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold text-gray-400 mb-8">
            Trusted by creators, used daily by 10K+ X users
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-dark-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing">
        <Pricing />
      </section>

      {/* FAQ Section */}
      <section id="faq">
        <FAQ />
      </section>

      {/* Final CTA */}
      <section className="relative py-20 bg-gradient-to-b from-dark to-dark-secondary overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent rounded-full mix-blend-screen filter blur-3xl opacity-10" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to draft better replies?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join 10K+ creators who are saving time and getting more engagement on X.
          </p>
          <button className="px-10 py-4 bg-accent hover:bg-accent-dark text-dark font-bold rounded-full text-lg transition-all hover:shadow-lg hover:shadow-accent/20">
            Add to Chrome - It&apos;s Free
          </button>
          <p className="text-gray-500 text-sm mt-6">
            Free tier includes 10 drafts per day. Upgrade to Pro for unlimited.
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
