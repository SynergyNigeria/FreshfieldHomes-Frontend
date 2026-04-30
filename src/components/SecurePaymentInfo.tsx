"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FeatherIcon from "feather-icons-react";
import { PartialHome } from "@/lib/types";
import { formatPrice } from "@/lib/data";
import { unlockPartialHomeInfo } from "@/lib/api";
import CounterPayModal from "@/components/CounterPayModal";

export default function SecurePaymentInfo({ home }: { home: PartialHome }) {
  const [unlocked, setUnlocked] = useState(false);
  const [unlockedHome, setUnlockedHome] = useState<PartialHome | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setIsUnlocking(true);
    const response = await unlockPartialHomeInfo(home.id, code);
    setIsUnlocking(false);

    if (!response || !response.payer) {
      setError("Incorrect code. Please try again.");
      setCode("");
      return;
    }

    setUnlockedHome(response);
    setUnlocked(true);
    setShowPrompt(false);
    setError("");
  }

  /* ── LOCKED STATE ── */
  if (!unlocked) {
    return (
      <div className="space-y-5">
        {/* Teaser card */}
        <div className="bg-white border border-beige-dark/30 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-beige flex items-center justify-center">
              <FeatherIcon icon="lock" size={18} className="text-accent" />
            </div>
            <div>
              <p className="font-semibold text-accent text-sm">Payment Details Protected</p>
              <p className="text-xs text-muted">Enter your secure code to view</p>
            </div>
          </div>

          {/* Blurred preview */}
          <div className="relative mb-5 overflow-hidden rounded">
            <div className="space-y-3 blur-sm select-none pointer-events-none">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Full Price</span>
                <span className="font-bold text-accent">$•••,•••</span>
              </div>
              <div className="h-3 bg-beige-dark/30 rounded overflow-hidden">
                <div className="h-full bg-amber-400 w-[45%]" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Amount Paid</span>
                <span className="font-semibold text-amber-600">$•••,•••</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Remaining</span>
                <span className="font-bold text-accent">$•••,•••</span>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FeatherIcon icon="lock" size={28} className="text-accent/30" />
            </div>
          </div>

          {!showPrompt ? (
            <button
              onClick={() => setShowPrompt(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-accent text-white px-5 py-3 text-sm font-medium hover:bg-accent-light transition-colors duration-200"
            >
              <FeatherIcon icon="unlock" size={16} />
              View Payment Details
            </button>
          ) : (
            <form onSubmit={handleUnlock} className="space-y-3">
              <label
                htmlFor="secure-code"
                className="block text-sm font-medium text-accent"
              >
                Enter Secure Code
              </label>
              <div className="relative">
                <input
                  id="secure-code"
                  type={showCode ? "text" : "password"}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className={`w-full pr-10 pl-4 py-3 border text-sm focus:outline-none bg-white transition-colors ${
                    error
                      ? "border-red-400 focus:border-red-400"
                      : "border-beige-dark/50 focus:border-accent"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCode((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                  tabIndex={-1}
                >
                  <FeatherIcon icon={showCode ? "eye-off" : "eye"} size={16} />
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <FeatherIcon icon="alert-circle" size={13} />
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isUnlocking}
                  className="flex-1 bg-accent text-white py-2.5 text-sm font-medium hover:bg-accent-light transition-colors disabled:opacity-70"
                >
                  {isUnlocking ? "Unlocking..." : "Unlock"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPrompt(false);
                    setCode("");
                    setError("");
                  }}
                  className="flex-1 border border-beige-dark/50 text-muted py-2.5 text-sm hover:bg-beige-light transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Locked payer card */}
        <div className="bg-amber-50 border border-amber-200 p-6 relative overflow-hidden">
          <div className="blur-sm select-none pointer-events-none space-y-3">
            <p className="text-sm font-semibold text-accent">Current Partial Owner</p>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Name</span>
              <span className="font-medium text-accent">J•••• D••</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Amount Paid</span>
              <span className="font-medium text-amber-700">$•••,•••</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Date Paid</span>
              <span className="font-medium text-accent">••• ••, ••••</span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 text-amber-700/60 text-sm font-medium">
              <FeatherIcon icon="lock" size={16} />
              Code required to view
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── UNLOCKED STATE ── */
  return (
    <div className="space-y-5">
      {/* Unlocked indicator */}
      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2">
        <FeatherIcon icon="unlock" size={13} />
        Payment details unlocked
      </div>

      {/* Price card */}
      <div className="bg-white border border-beige-dark/30 p-6 shadow-sm">
        <p className="text-xs text-muted uppercase tracking-widest mb-1">Full Price</p>
        <p className="text-3xl font-bold text-accent mb-5">
          {formatPrice(home.fullPrice)}
        </p>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-muted mb-1.5">
            <span>Payment Progress</span>
            <span className="font-semibold text-amber-600">{home.percentagePaid}% Paid</span>
          </div>
          <div className="h-3 bg-beige-dark/30">
            <div
              className="h-full bg-amber-500 transition-all duration-700"
              style={{ width: `${home.percentagePaid}%` }}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Amount Paid</span>
            <span className="font-semibold text-amber-600">{formatPrice(home.amountPaid)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-beige-dark/20 pt-3">
            <span className="text-muted font-medium">Remaining (Your Buy-In)</span>
            <span className="font-bold text-accent">{formatPrice(home.remainingAmount)}</span>
          </div>
        </div>

        <CounterPayModal home={home} />
      </div>

      {/* Payer info */}
      <div className="bg-amber-50 border border-amber-200 p-6">
        <h3 className="text-sm font-semibold text-accent mb-4 flex items-center gap-2">
          <FeatherIcon icon="user" size={15} className="text-amber-600" />
          Current Partial Owner
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Name</span>
            <span className="font-medium text-accent">{unlockedHome?.payer?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Amount Paid</span>
            <span className="font-medium text-amber-700">
              {formatPrice(unlockedHome?.payer?.amountPaid ?? 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Date Paid</span>
            <span className="font-medium text-accent">{unlockedHome?.payer?.datePaid}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Percentage</span>
            <span className="font-medium text-accent">{unlockedHome?.payer?.percentagePaid}%</span>
          </div>
          <div className="flex justify-between border-t border-amber-200/60 pt-3">
            <span className="text-muted">Location</span>
            <span className="font-medium text-accent text-right">
              {home.address},<br />{home.city}, {home.state}
            </span>
          </div>
        </div>
      </div>

      {/* Agent card */}
      <div className="bg-white border border-beige-dark/30 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-accent mb-4 flex items-center gap-2">
          <FeatherIcon icon="briefcase" size={15} className="text-muted" />
          Listing Agent
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-14 h-14 overflow-hidden rounded-full shrink-0">
            <Image
              src={home.agent.image}
              alt={home.agent.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div>
            <p className="font-semibold text-accent">{home.agent.name}</p>
            <p className="text-xs text-muted">{home.agent.phone}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/chat"
            className="flex items-center justify-center gap-1.5 border border-beige-dark/50 py-2.5 text-xs font-medium text-accent hover:bg-beige transition-colors"
          >
            <FeatherIcon icon="message-circle" size={13} />
            Chat
          </Link>
          <a
            href={`mailto:${home.agent.email}`}
            className="flex items-center justify-center gap-1.5 border border-beige-dark/50 py-2.5 text-xs font-medium text-accent hover:bg-beige transition-colors"
          >
            <FeatherIcon icon="mail" size={13} />
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
