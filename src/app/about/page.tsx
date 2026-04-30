import Image from "next/image";
import Link from "next/link";
import FeatherIcon from "feather-icons-react";
import { getAgents } from "@/lib/api";

export default async function AboutPage() {
  const agents = await getAgents();

  return (
    <>
      {/* Hero */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&h=1080&fit=crop"
          alt="Our team"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <p className="text-beige text-sm font-semibold uppercase tracking-[0.3em] mb-4">
            Our Story
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white">About Fresh Fields Homes</h1>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted mb-2">
              Our Mission
            </p>
            <h2 className="text-3xl font-bold text-accent mb-6">
              Helping Families Find Their Forever Home
            </h2>
            <p className="text-muted leading-relaxed mb-4">
              At Fresh Fields Homes, we believe everyone deserves a place to call home. Founded in 2020,
              we&apos;ve grown from a small local agency to a trusted name in real estate by putting
              families first in everything we do.
            </p>
            <p className="text-muted leading-relaxed mb-6">
              Our approach is simple: listen carefully, search diligently, and guide you through
               every step of the home-buying journey. We don&apos;t just sell houses; we help you
              find the backdrop for your family&apos;s story.
            </p>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "500+", label: "Homes Sold" },
                { value: "98%", label: "Client Satisfaction" },
              ].map((stat) => (
                <div key={stat.label} className="bg-beige-light p-4">
                  <p className="text-2xl font-bold text-accent">{stat.value}</p>
                  <p className="text-sm text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-[400px]">
            <Image
              src="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&h=600&fit=crop"
              alt="Beautiful home interior"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-beige-light py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted mb-2">
              What Drives Us
            </p>
            <h2 className="text-3xl font-bold text-accent">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "heart",
                title: "Family First",
                desc: "We treat every client like family, understanding that buying a home is one of life's most important decisions.",
              },
              {
                icon: "shield",
                title: "Trust & Transparency",
                desc: "Honest communication and complete transparency in every transaction. No hidden fees, no surprises.",
              },
              {
                icon: "star",
                title: "Excellence",
                desc: "We go above and beyond to deliver exceptional service, from the first showing to handing over the keys.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white p-8 text-center border border-beige-dark/30">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-beige mb-5">
                  <FeatherIcon icon={item.icon} size={24} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-accent mb-3">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted mb-2">
            The People Behind Fresh Fields Homes
          </p>
          <h2 className="text-3xl font-bold text-accent">Meet Our Agents</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agents.map((agent) => (
            <div key={agent.id} className="text-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden mx-auto mb-4">
                <Image src={agent.image} alt={agent.name} fill className="object-cover" />
              </div>
              <h3 className="text-lg font-semibold text-accent">{agent.name}</h3>
              <p className="text-sm text-muted mb-3">Real Estate Specialist</p>
              <div className="flex items-center justify-center gap-3 text-sm text-muted">
                <a href={`mailto:${agent.email}`} className="hover:text-accent transition-colors">
                  <FeatherIcon icon="mail" size={16} />
                </a>
                <a href={`tel:${agent.phone}`} className="hover:text-accent transition-colors">
                  <FeatherIcon icon="phone" size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-accent py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Let&apos;s Find Your Home</h2>
          <p className="text-white/60 mb-8">
            Ready to start your journey? Our team is here to help every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 bg-beige text-accent px-8 py-4 font-semibold text-sm hover:bg-beige-dark transition-colors duration-200"
            >
              Browse Homes
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 font-semibold text-sm hover:bg-white/10 transition-colors duration-200"
            >
              <FeatherIcon icon="message-circle" size={18} />
              Chat with Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
