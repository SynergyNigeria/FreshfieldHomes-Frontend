"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FeatherIcon from "feather-icons-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";
const AGENT_REGISTRATION_FEE = 25;

function PaymentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromQuery = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailFromQuery);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agentCode, setAgentCode] = useState("");

  function formatCardNumber(val: string) {
    return val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setProcessing(true);

    // Simulate a brief payment processing delay, then call the backend to activate the account.
    // In production you would integrate a real payment gateway (Stripe, PayStack, etc.) and pass
    // a confirmed payment_intent id.  For now the backend trusts the frontend confirmation.
    await new Promise((r) => setTimeout(r, 1500));

    try {
      // First fetch the application to get the payment_token
      const statusRes = await fetch(
        `${API_BASE}/agent-applications/status/?email=${encodeURIComponent(email.trim())}`,
      );
      const statusData = (await statusRes.json()) as {
        status?: string;
        payment_token?: string;
        detail?: string;
      };

      if (!statusRes.ok) {
        setError(statusData.detail ?? "Could not find your application.");
        return;
      }

      if (statusData.status !== "approved") {
        setError("Your application is not yet approved for payment.");
        return;
      }

      if (!statusData.payment_token) {
        setError("Payment token not available. Please contact support.");
        return;
      }

      const activateRes = await fetch(`${API_BASE}/agent-applications/complete-payment/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          payment_token: statusData.payment_token,
        }),
      });

      const activateData = (await activateRes.json()) as {
        agent_code?: string;
        detail?: string;
      };

      if (!activateRes.ok) {
        setError(activateData.detail ?? "Activation failed. Please try again.");
        return;
      }

      setAgentCode(activateData.agent_code ?? "");
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FeatherIcon icon="check-circle" size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-accent mb-3">Payment Successful!</h2>
        <p className="text-muted mb-4">
          Your agent account is now active. Welcome to the Fresh Fields Homes team!
        </p>
        {agentCode && (
          <div className="bg-beige border border-beige-dark/30 px-6 py-4 mb-6 inline-block">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">
              Your Agent Code
            </p>
            <p className="text-2xl font-bold text-accent tracking-widest">{agentCode}</p>
            <p className="text-xs text-muted mt-1">Keep this safe — you'll use it to log in.</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/agent-portal")}
            className="inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 text-sm font-semibold hover:bg-accent-light transition-colors"
          >
            <FeatherIcon icon="log-in" size={16} />
            Go to Agent Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="bg-beige border border-beige-dark/20 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">Registration Fee</p>
          <p className="text-2xl font-bold text-accent">${AGENT_REGISTRATION_FEE}.00</p>
        </div>
        <FeatherIcon icon="shield" size={28} className="text-accent opacity-40" />
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          <FeatherIcon icon="alert-circle" size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-accent mb-1.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-beige-dark/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
          placeholder="Registered email"
        />
      </div>

      <div className="border-t border-beige-dark/20 pt-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">
          Card Details
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-accent mb-1.5">Name on Card</label>
            <input
              type="text"
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Full name as on card"
              className="w-full border border-beige-dark/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-accent mb-1.5">Card Number</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="w-full border border-beige-dark/40 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-accent"
              />
              <FeatherIcon icon="credit-card" size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-accent mb-1.5">Expiry Date</label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full border border-beige-dark/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-accent mb-1.5">CVV</label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="•••"
                maxLength={4}
                className="w-full border border-beige-dark/40 px-4 py-3 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={processing}
        className="w-full bg-accent text-white py-3.5 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-accent-light transition-colors disabled:opacity-60"
      >
        {processing ? (
          <>
            <FeatherIcon icon="loader" size={16} className="animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <FeatherIcon icon="lock" size={16} />
            Pay ${AGENT_REGISTRATION_FEE}.00 Securely
          </>
        )}
      </button>

      <p className="text-xs text-muted text-center flex items-center justify-center gap-1.5">
        <FeatherIcon icon="lock" size={12} />
        Payments are encrypted and secure
      </p>
    </form>
  );
}

export default function AgentPaymentPage() {
  return (
    <main className="min-h-screen bg-beige-light py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-semibold px-4 py-2 uppercase tracking-widest mb-4">
            <FeatherIcon icon="credit-card" size={14} />
            Agent Activation
          </div>
          <h1 className="text-2xl font-bold text-accent mb-2">Complete Registration</h1>
          <p className="text-muted text-sm">
            One-time payment to activate your Fresh Fields Homes agent account.
          </p>
        </div>

        <div className="bg-white border border-beige-dark/20 p-8">
          <Suspense fallback={<div className="text-muted text-sm text-center py-8">Loading…</div>}>
            <PaymentForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
