"use client";

import { useState } from "react";
import FeatherIcon from "feather-icons-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      {/* Header */}
      <section className="bg-beige-light py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted mb-2">
            Get in Touch
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-accent">Contact Us</h1>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold text-accent mb-6">Send Us a Message</h2>

            {submitted ? (
              <div className="bg-beige-light p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-beige mb-4">
                  <FeatherIcon icon="check" size={24} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-accent mb-2">Message Sent!</h3>
                <p className="text-sm text-muted">
                  Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm text-accent underline hover:no-underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-accent mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      className="w-full px-4 py-3 border border-beige-dark/50 text-sm focus:outline-none focus:border-accent bg-white"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-accent mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      className="w-full px-4 py-3 border border-beige-dark/50 text-sm focus:outline-none focus:border-accent bg-white"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-accent mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 border border-beige-dark/50 text-sm focus:outline-none focus:border-accent bg-white"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-accent mb-1.5">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-3 border border-beige-dark/50 text-sm focus:outline-none focus:border-accent bg-white"
                    placeholder="(555) 000-0000"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-accent mb-1.5">
                    Subject
                  </label>
                  <select
                    id="subject"
                    required
                    className="w-full px-4 py-3 border border-beige-dark/50 text-sm focus:outline-none focus:border-accent bg-white text-muted"
                  >
                    <option value="">Select a subject</option>
                    <option value="buying">Buying a Home</option>
                    <option value="selling">Selling a Home</option>
                    <option value="viewing">Schedule a Viewing</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-accent mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-beige-dark/50 text-sm focus:outline-none focus:border-accent bg-white resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-accent text-white px-6 py-3.5 text-sm font-medium hover:bg-accent-light transition-colors duration-200"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-semibold text-accent mb-6">Contact Information</h2>
            <div className="space-y-6 mb-10">
              {[
                {
                  icon: "map-pin",
                  title: "Visit Us",
                  lines: ["123 Real Estate Boulevard", "Austin, TX 78701"],
                },
                {
                  icon: "phone",
                  title: "Call Us",
                  lines: ["(555) 000-1234", "Mon – Fri, 9am – 6pm CT"],
                },
                {
                  icon: "mail",
                  title: "Email Us",
                  lines: ["hello@freshfieldshomes.com", "We reply within 24 hours"],
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-beige flex items-center justify-center">
                    <FeatherIcon icon={item.icon} size={20} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-accent text-sm mb-1">{item.title}</h3>
                    {item.lines.map((line) => (
                      <p key={line} className="text-sm text-muted">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="bg-beige h-72 flex items-center justify-center">
              <div className="text-center">
                <FeatherIcon icon="map" size={40} className="text-muted mx-auto mb-2" />
                <p className="text-sm text-muted">Interactive Map</p>
                <p className="text-xs text-muted/60">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
