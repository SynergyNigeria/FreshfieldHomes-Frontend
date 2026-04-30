"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import FeatherIcon from "feather-icons-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/listings", label: "Browse Homes" },
    { href: "/partial-homes", label: "Partial Homes" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/chat", label: "Live Chat" },
    { href: "/agent-portal", label: "Agent Login" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-beige-dark/30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Fresh Fields Homes"
              width={100}
              height={60}
              className="object-contain translate-y-1 drop-shadow-[0_6px_6px_rgba(0,0,0,0.22)]"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:block relative">
            <span className="pointer-events-none absolute -left-3 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-2 border-beige-dark/70 border-r-0" />
            <span className="pointer-events-none absolute -right-3 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-2 border-beige-dark/70 border-l-0" />
            <div className="flex items-center gap-2 rounded-full border border-beige-dark/60 bg-linear-to-r from-beige-light/95 via-white to-beige-light/95 px-3 py-1.5 shadow-[0_10px_20px_rgba(26,26,26,0.08)]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:bg-white hover:text-accent transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-light transition-colors duration-200"
            >
              <FeatherIcon icon="message-circle" size={16} />
              Chat Now
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-accent"
            aria-label="Toggle menu"
          >
            <FeatherIcon icon={mobileOpen ? "x" : "menu"} size={24} />
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-6 border-t border-beige-dark/30">
            <div className="relative mt-4 rounded-3xl border border-beige-dark/50 bg-linear-to-b from-beige-light/95 to-white p-2 shadow-[0_12px_24px_rgba(26,26,26,0.08)]">
              <span className="pointer-events-none absolute -top-2 left-6 h-4 w-8 rounded-t-full border-2 border-beige-dark/60 border-b-0" />
              <span className="pointer-events-none absolute -top-2 right-6 h-4 w-8 rounded-t-full border-2 border-beige-dark/60 border-b-0" />
              <div className="flex flex-col gap-1 pt-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-muted hover:text-accent hover:bg-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/chat"
                onClick={() => setMobileOpen(false)}
                className="mx-2 mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-light transition-colors duration-200"
              >
                <FeatherIcon icon="message-circle" size={16} />
                Chat Now
              </Link>
            </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
