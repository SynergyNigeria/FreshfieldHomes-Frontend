import Link from "next/link";
import Image from "next/image";
import FeatherIcon from "feather-icons-react";
import PropertyCard from "@/components/PropertyCard";
import PartialPayCard from "@/components/PartialPayCard";
import ShuffledGrid from "@/components/ShuffledGrid";
import { getFeaturedProperties, getPartialHomes } from "@/lib/api";

export default async function Home() {
  const [featured, partialHomes] = await Promise.all([
    getFeaturedProperties(),
    getPartialHomes(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop"
          alt="Beautiful family home"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <p className="text-beige text-sm font-semibold uppercase tracking-[0.3em] mb-4">
            Welcome to Fresh Fields Homes
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Find the Home
            <br />
            Your Family Deserves
          </h1>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Discover handpicked properties in the most desirable neighborhoods.
            Your perfect home is waiting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 bg-white text-accent px-8 py-4 font-semibold text-sm hover:bg-beige transition-colors duration-200"
            >
              <FeatherIcon icon="search" size={18} />
              Browse Homes
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 font-semibold text-sm hover:bg-white/10 transition-colors duration-200"
            >
              <FeatherIcon icon="message-circle" size={18} />
              Talk to an Agent
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Homes Sold" },
              { value: "200+", label: "Happy Families" },
              { value: "50+", label: "Expert Agents" },
              { value: "15+", label: "Years Experience" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-accent">{stat.value}</p>
                <p className="text-sm text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted mb-2">
            Curated Selection
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-accent">
            Featured Properties
          </h2>
        </div>
        <ShuffledGrid
          items={featured}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          renderItem={(property) => (
            <PropertyCard key={property.id} property={property} />
          )}
        />
        <div className="text-center mt-12">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 font-semibold text-sm hover:bg-accent-light transition-colors duration-200"
          >
            View All Listings
            <FeatherIcon icon="arrow-right" size={18} />
          </Link>
        </div>
      </section>

      {/* Partially Paid Homes */}
      <section className="bg-amber-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="inline-block bg-amber-500 text-white text-xs font-semibold px-4 py-1.5 uppercase tracking-widest mb-4">
                Partial Pay
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-accent">
                Homes With a Head Start
              </h2>
              <p className="text-muted mt-2 max-w-xl">
                These properties already have an initial payment committed. Counter-pay the
                remaining balance and the home is yours.
              </p>
            </div>
            <Link
              href="/partial-homes"
              className="inline-flex items-center gap-2 shrink-0 border-2 border-accent text-accent px-6 py-3 text-sm font-semibold hover:bg-accent hover:text-white transition-colors duration-200"
            >
              View All Partial Homes
              <FeatherIcon icon="arrow-right" size={18} />
            </Link>
          </div>

          <ShuffledGrid
            items={partialHomes}
            limit={4}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            renderItem={(home) => (
              <PartialPayCard key={home.id} home={home} />
            )}
          />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-beige-light py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted mb-2">
              Why Fresh Fields Homes
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-accent">
              We Make It Simple
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "search",
                title: "Find Your Home",
                desc: "Browse our curated collection of beautiful homes. Filter by location, price, and features to find exactly what you need.",
              },
              {
                icon: "message-circle",
                title: "Chat with Experts",
                desc: "Connect instantly with our experienced agents through live chat. Get answers to your questions in real time.",
              },
              {
                icon: "key",
                title: "Move In",
                desc: "We handle the paperwork and negotiations so you can focus on what matters: making your new house a home.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-8 text-center border border-beige-dark/30 hover:shadow-md transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-beige mb-5">
                  <FeatherIcon icon={item.icon} size={24} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-accent mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Let our expert agents guide you through every step of the journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 bg-beige text-accent px-8 py-4 font-semibold text-sm hover:bg-beige-dark transition-colors duration-200"
            >
              Browse Homes
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 font-semibold text-sm hover:bg-white/10 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
