"use client";

import { useState } from "react";
import FeatherIcon from "feather-icons-react";
import { PartialHome } from "@/lib/types";
import { formatPrice } from "@/lib/data";
import { submitCounterPayRequest } from "@/lib/api";

export default function CounterPayModal({ home }: { home: PartialHome }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    const ok = await submitCounterPayRequest(home.id, email);
    setSubmitting(false);

    if (!ok) {
      setSubmitError("Unable to send request right now. Please try again.");
      return;
    }

    setSent(true);
  }

  function handleClose() {
    setOpen(false);
    // Reset after animation
    setTimeout(() => setSent(false), 300);
    setEmail("");
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 text-white px-6 py-4 text-sm font-semibold hover:bg-amber-600 transition-colors duration-200"
      >
        <FeatherIcon icon="repeat" size={18} />
        Counter Pay Request to Buy
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <div className="relative bg-white w-full max-w-md shadow-2xl z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-beige-dark/30">
              <div>
                <h2 className="text-lg font-semibold text-accent">Counter Pay Request</h2>
                <p className="text-xs text-muted mt-0.5">{home.title}</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-muted hover:text-accent transition-colors"
              >
                <FeatherIcon icon="x" size={20} />
              </button>
            </div>

            {!sent ? (
              <>
                {/* Price summary */}
                <div className="px-6 pt-5 pb-4">
                  <div className="bg-beige-light p-4 mb-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted">Full Property Price</span>
                      <span className="font-semibold text-accent">{formatPrice(home.fullPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted">
                        Amount Already Paid
                      </span>
                      <span className="font-semibold text-amber-600">
                        {formatPrice(home.amountPaid)} ({home.percentagePaid}%)
                      </span>
                    </div>
                    <div className="border-t border-beige-dark/40 mt-2 pt-2 flex justify-between text-sm">
                      <span className="text-muted font-medium">Your Buy-In (Remaining)</span>
                      <span className="font-bold text-accent">{formatPrice(home.remainingAmount)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted leading-relaxed mb-5">
                    By submitting, you're expressing interest in buying out this property
                    from its current partial owner. Our agent will review your request and
                    contact you with the next steps.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="counter-email"
                        className="block text-sm font-medium text-accent mb-1.5"
                      >
                        Your Email Address
                      </label>
                      <input
                        id="counter-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border border-beige-dark/50 text-sm focus:outline-none focus:border-accent bg-white"
                      />
                    </div>
                    {submitError ? (
                      <p className="text-xs text-red-500">{submitError}</p>
                    ) : null}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-amber-500 text-white px-6 py-3 text-sm font-semibold hover:bg-amber-600 transition-colors duration-200 disabled:opacity-70"
                    >
                      {submitting ? "Submitting..." : "Submit Counter Pay Request"}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Success state */
              <div className="px-6 py-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 mb-5">
                  <FeatherIcon icon="check-circle" size={32} className="text-amber-500" />
                </div>
                <h3 className="text-xl font-semibold text-accent mb-3">Request Sent!</h3>
                <p className="text-sm text-muted leading-relaxed mb-2">
                  Your counter pay request for{" "}
                  <span className="font-medium text-accent">{home.title}</span> has been
                  submitted successfully.
                </p>
                <p className="text-sm text-muted leading-relaxed mb-6">
                  Our agent{" "}
                  <span className="font-medium text-accent">{home.agent.name}</span> will
                  review your request and reach out to{" "}
                  <span className="font-medium text-accent">{email}</span> with an update
                  shortly.
                </p>
                <button
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 text-sm font-medium hover:bg-accent-light transition-colors duration-200"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
