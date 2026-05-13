"use client";

import { useState } from "react";
import Link from "next/link";
import FeatherIcon from "feather-icons-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

interface ApplicationStatus {
  id: number;
  full_name: string;
  status: "pending" | "approved" | "rejected" | "paid";
  rejection_reason: string;
  created_at: string;
}

export default function AgentApplicationStatusPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApplicationStatus | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE}/agent-applications/status/?email=${encodeURIComponent(email.trim())}`,
      );
      const data = (await res.json()) as ApplicationStatus & { detail?: string };

      if (!res.ok) {
        setError(data.detail ?? "No application found for this email.");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const statusConfig = {
    pending: {
      icon: "clock",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
      label: "Under Review",
      message: "Your application is being reviewed by our admin team. We'll be in touch soon.",
    },
    approved: {
      icon: "check-circle",
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
      label: "Approved — Payment Required",
      message:
        "Congratulations! Your application has been approved. Complete the $25 registration payment to activate your agent account.",
    },
    rejected: {
      icon: "x-circle",
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
      label: "Not Approved",
      message: "Unfortunately, your application was not approved at this time.",
    },
    paid: {
      icon: "award",
      color: "text-accent",
      bg: "bg-beige border-beige-dark/30",
      label: "Active Agent",
      message: "Your agent account is fully activated. Log in to the Agent Portal to get started.",
    },
  };

  return (
    <main className="min-h-screen bg-beige-light flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-accent mb-2">Check Application Status</h1>
          <p className="text-muted text-sm">Enter your email address to see the status of your agent application.</p>
        </div>

        <form onSubmit={handleCheck} className="bg-white border border-beige-dark/20 p-6 mb-6">
          <label className="block text-sm font-medium text-accent mb-1.5">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-beige-dark/40 px-4 py-3 text-sm focus:outline-none focus:border-accent mb-4"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3 font-semibold text-sm hover:bg-accent-light transition-colors disabled:opacity-60"
          >
            {loading ? "Checking…" : "Check Status"}
          </button>
        </form>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">
            <FeatherIcon icon="alert-circle" size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {result && (() => {
          const cfg = statusConfig[result.status];
          return (
            <div className={`border p-6 ${cfg.bg}`}>
              <div className="flex items-center gap-3 mb-4">
                <FeatherIcon icon={cfg.icon} size={24} className={cfg.color} />
                <div>
                  <p className="font-semibold text-accent">{result.full_name}</p>
                  <p className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</p>
                </div>
              </div>
              <p className="text-sm text-muted mb-4">{cfg.message}</p>

              {result.status === "rejected" && result.rejection_reason && (
                <div className="bg-white border border-red-200 px-4 py-3 text-sm text-muted mb-4">
                  <strong className="text-accent">Reason: </strong>
                  {result.rejection_reason}
                </div>
              )}

              {result.status === "approved" && (
                <Link
                  href={`/become-an-agent/payment?email=${encodeURIComponent(email.trim())}`}
                  className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 text-sm font-semibold hover:bg-accent-light transition-colors"
                >
                  <FeatherIcon icon="credit-card" size={16} />
                  Complete Payment — $25
                </Link>
              )}

              {result.status === "paid" && (
                <Link
                  href="/agent-portal"
                  className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 text-sm font-semibold hover:bg-accent-light transition-colors"
                >
                  <FeatherIcon icon="log-in" size={16} />
                  Go to Agent Portal
                </Link>
              )}
            </div>
          );
        })()}

        <p className="text-center text-sm text-muted mt-6">
          Haven&apos;t applied yet?{" "}
          <Link href="/become-an-agent" className="text-accent underline">
            Register as an Agent
          </Link>
        </p>
      </div>
    </main>
  );
}
