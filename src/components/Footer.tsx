import Link from "next/link";
import Image from "next/image";
import FeatherIcon from "feather-icons-react";

export default function Footer() {
  return (
    <footer className="bg-accent text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/logo.png"
                alt="Fresh Fields Homes"
                width={110}
                height={55}
                className="object-contain"
              />
            </Link>
            <p className="text-sm text-white/60 leading-relaxed">
              Helping families find their perfect home since 2020. Your dream
              home is just a click away.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-beige">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/listings", label: "Browse Homes" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/chat", label: "Live Chat" },
                { href: "/agent-portal", label: "Agent Login" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-beige">
              Property Types
            </h4>
            <ul className="space-y-3">
              {["Houses", "Apartments", "Condos", "Townhouses"].map((type) => (
                <li key={type}>
                  <Link
                    href="/listings"
                    className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                  >
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-beige">
              Get in Touch
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-white/60">
                <FeatherIcon icon="map-pin" size={16} className="text-beige" />
                123 Real Estate Blvd, Austin, TX
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <FeatherIcon icon="phone" size={16} className="text-beige" />
                (555) 000-1234
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <FeatherIcon icon="mail" size={16} className="text-beige" />
                hello@freshfieldshomes.com
              </li>
            </ul>
            {/* Social */}
            <div className="flex items-center gap-4 mt-6">
              {["facebook", "instagram", "twitter", "linkedin"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-white/40 hover:text-beige transition-colors duration-200"
                  aria-label={social}
                >
                  <FeatherIcon icon={social} size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Fresh Fields Homes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
