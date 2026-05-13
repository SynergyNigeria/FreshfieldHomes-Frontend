"use client";

import { useState } from "react";
import Link from "next/link";
import FeatherIcon from "feather-icons-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

type Step = "form" | "success";

export default function BecomeAnAgentPage() {
  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/agent-applications/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          country: country.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        }),
      });

      const data = (await res.json()) as Record<string, unknown>;

      if (!res.ok) {
        const msg =
          typeof data.email === "object" && Array.isArray(data.email)
            ? (data.email as string[])[0]
            : typeof data.detail === "string"
              ? data.detail
              : "Submission failed. Please try again.";
        setError(msg);
        return;
      }

      setStep("success");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "success") {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FeatherIcon icon="check-circle" size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-accent mb-3">Application Submitted!</h1>
          <p className="text-muted mb-6">
            Thank you for your interest in joining Fresh Fields Homes as an agent. We'll review
            your application and notify you by email once a decision has been made.
          </p>
          <p className="text-sm text-muted mb-8">
            You can check the status of your application at any time using your email address.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 text-sm font-semibold hover:bg-accent-light transition-colors"
            >
              <FeatherIcon icon="home" size={16} />
              Back to Home
            </Link>
            <Link
              href="/become-an-agent/status"
              className="inline-flex items-center justify-center gap-2 border-2 border-accent text-accent px-6 py-3 text-sm font-semibold hover:bg-accent hover:text-white transition-colors"
            >
              <FeatherIcon icon="search" size={16} />
              Check Status
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-beige-light">
      {/* Hero */}
      <section className="bg-accent text-white py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-4 py-2 uppercase tracking-widest mb-6">
            <FeatherIcon icon="briefcase" size={14} />
            Join Our Team
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Become an Agent</h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            Partner with Fresh Fields Homes and help families find their dream homes. Apply below
            to start your journey.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { icon: "dollar-sign", title: "Competitive Commission", desc: "Earn industry-leading commissions on every successful deal." },
          { icon: "users", title: "Exclusive Listings", desc: "Get access to our curated portfolio of premium properties." },
          { icon: "trending-up", title: "Growth Support", desc: "Training, tools, and mentorship to grow your real-estate career." },
        ].map((b) => (
          <div key={b.title} className="bg-white p-6 border border-beige-dark/20 text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FeatherIcon icon={b.icon} size={22} className="text-accent" />
            </div>
            <h3 className="font-semibold text-accent mb-2">{b.title}</h3>
            <p className="text-sm text-muted">{b.desc}</p>
          </div>
        ))}
      </section>

      {/* Form */}
      <section className="max-w-lg mx-auto px-4 pb-20">
        <div className="bg-white border border-beige-dark/20 p-8">
          <h2 className="text-xl font-bold text-accent mb-1">Agent Registration Form</h2>
          <p className="text-sm text-muted mb-6">
            Fill in your details below. Our admin team will review your application within 2–3
            business days.
          </p>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              <FeatherIcon icon="alert-circle" size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-accent mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full border border-beige-dark/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-accent mb-1.5">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States"
                className="w-full border border-beige-dark/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-accent mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-beige-dark/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-accent mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full border border-beige-dark/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent text-white py-3 font-semibold text-sm hover:bg-accent-light transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </button>
          </form>

          <p className="text-xs text-muted mt-4 text-center">
            Already applied?{" "}
            <Link href="/become-an-agent/status" className="text-accent underline">
              Check your status
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
