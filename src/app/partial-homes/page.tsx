import { getPartialHomes } from "@/lib/api";
import PartialPayCard from "@/components/PartialPayCard";
import FeatherIcon from "feather-icons-react";

export const metadata = {
  title: "Partially Paid Homes | Fresh Fields Homes",
  description:
    "Browse homes with partial payment already committed. Counter-pay to complete the purchase and move in sooner.",
};

export default async function PartialHomesPage() {
  const partialHomes = await getPartialHomes().catch(() => []);

  return (
    <>
      {/* Hero */}
      <section className="bg-accent text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block bg-amber-500 text-white text-xs font-semibold px-4 py-1.5 uppercase tracking-widest mb-6">
            Partially Paid Listings
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Step In &amp; Complete the Purchase
          </h1>
          <p className="text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
            These homes have an initial payment already committed by another buyer.
            Counter-pay the remaining balance and the property is yours, it&apos;s that
            simple.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-beige-light py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            {
              icon: "search",
              title: "Browse Listings",
              desc: "Find a partially paid home that fits your budget and lifestyle.",
            },
            {
              icon: "repeat",
              title: "Counter Pay",
              desc: "Submit a counter-pay request to our agent for the remaining balance.",
            },
            {
              icon: "key",
              title: "Move In",
              desc: "Agent confirms the transfer, paperwork is handled, and you get the keys.",
            },
          ].map((step) => (
            <div key={step.title} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 flex items-center justify-center">
                <FeatherIcon icon={step.icon} size={22} className="text-amber-600" />
              </div>
              <p className="font-semibold text-accent">{step.title}</p>
              <p className="text-sm text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Listings grid */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-accent">Available Partial Listings</h2>
              <p className="text-muted text-sm mt-1">
                {partialHomes.length} homes available for counter payment
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {partialHomes.map((home) => (
              <PartialPayCard key={home.id} home={home} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-beige py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-accent mb-4">Not sure where to start?</h2>
        <p className="text-muted mb-8 max-w-xl mx-auto">
          Our agents are ready to walk you through the counter-pay process step by step.
        </p>
        <a
          href="/chat"
          className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 text-sm font-semibold hover:bg-accent-light transition-colors duration-200"
        >
          <FeatherIcon icon="message-circle" size={18} />
          Talk to an Agent
        </a>
      </section>
    </>
  );
}
