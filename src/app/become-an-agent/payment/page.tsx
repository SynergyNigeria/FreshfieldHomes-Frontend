"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FeatherIcon from "feather-icons-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";
const PAYSTACK_PUBLIC_KEY = "pk_test_123d132d98faf5a7cf93747861caaffc33d7f840";

// Extend Window to include PaystackPop injected by the inline script
declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

function PaymentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromQuery = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailFromQuery);
  const [initializing, setInitializing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [agentCode, setAgentCode] = useState("");
  const [ngnAmount, setNgnAmount] = useState<number | null>(null);

  // Load Paystack inline script once
  const scriptLoaded = useRef(false);
  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  async function activateAccount(reference: string, token: string) {
    setProcessing(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/agent-applications/complete-payment/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          payment_token: token,
          paystack_reference: reference,
        }),
      });
      const data = (await res.json()) as { agent_code?: string; detail?: string };
      if (!res.ok) {
        setError(data.detail ?? "Activation failed. Please contact support.");
        return;
      }
      setAgentCode(data.agent_code ?? "");
      setSuccess(true);
    } catch {
      setError("Network error during activation. Please contact support.");
    } finally {
      setProcessing(false);
    }
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInitializing(true);

    try {
      // Get application status to obtain payment_token
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

      const token = statusData.payment_token;

      // Initialize Paystack transaction on the backend (converts $25 â†’ NGN kobo)
      const initRes = await fetch(`${API_BASE}/agent-applications/initialize-payment/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), payment_token: token }),
      });
      const initData = (await initRes.json()) as {
        amount_kobo?: number;
        ngn_rate?: number;
        detail?: string;
      };

      if (!initRes.ok) {
        setError(initData.detail ?? "Could not initialize payment.");
        return;
      }

      const { amount_kobo } = initData;
      setNgnAmount(amount_kobo ? amount_kobo / 100 : null);

      if (!window.PaystackPop) {
        setError("Paystack script has not loaded yet. Please wait a moment and try again.");
        return;
      }

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email.trim().toLowerCase(),
        amount: amount_kobo!,
        currency: "NGN",
        ref: `freshfields-agent-${Date.now()}`,
        callback(response) {
          void activateAccount(response.reference, token);
        },
        onClose() {
          setError("Payment cancelled. Try again when ready.");
        },
      });
      handler.openIframe();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setInitializing(false);
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
            <p className="text-xs text-muted mt-1">Keep this safe â€” you'll use it to log in.</p>
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
          <p className="text-2xl font-bold text-accent">$25.00</p>
          {ngnAmount !== null && (
            <p className="text-xs text-muted mt-0.5">â‰ˆ â‚¦{ngnAmount.toLocaleString()} at today's rate</p>
          )}
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

      <button
        type="submit"
        disabled={initializing || processing}
        className="w-full bg-accent text-white py-3.5 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-accent-light transition-colors disabled:opacity-60"
      >
        {initializing || processing ? (
          <>
            <FeatherIcon icon="loader" size={16} className="animate-spin" />
            {initializing ? "Preparing paymentâ€¦" : "Verifying paymentâ€¦"}
          </>
        ) : (
          <>
            <FeatherIcon icon="lock" size={16} />
            Pay $25.00 via Paystack
          </>
        )}
      </button>

      <p className="text-xs text-muted text-center flex items-center justify-center gap-1.5">
        <FeatherIcon icon="lock" size={12} />
        Secured by Paystack â€” â‚¦ equivalent charged at live exchange rate
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
