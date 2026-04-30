"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import FeatherIcon from "feather-icons-react";
import { formatPrice } from "@/lib/data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";
const STORAGE_KEY = "fresh-fields-agent-code";
const POLL_INTERVAL_MS = 3000;

function normalizeAgentCode(value: string): string {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const letters = cleaned.slice(0, 3).replace(/[^A-Z]/g, "");
  const digits = cleaned.slice(3, 6).replace(/[^0-9]/g, "");
  if (!letters) return "";
  if (!digits) return letters;
  return `${letters}-${digits}`;
}

type Tab = "listings" | "messages";

interface AgentInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  image: string;
}

interface PropertyItem {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number | string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image: string;
  type: string;
  status: string;
  yearBuilt: number;
}

interface ContactItem {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface LiveChatMessage {
  id: number;
  sender: "user" | "agent";
  text: string;
  created_at: string;
}

interface LiveChatThread {
  id: number;
  propertyId: string;
  propertyTitle: string;
  userIp: string;
  created_at: string;
  updated_at: string;
  lastMessage: LiveChatMessage | null;
}

async function agentFetch<T>(path: string, code: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "X-Agent-Code": code },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}

export default function AgentPortalPage() {
  const [codeInput, setCodeInput] = useState("");
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [agentCode, setAgentCode] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<Tab>("listings");
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [threads, setThreads] = useState<LiveChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [threadMessages, setThreadMessages] = useState<LiveChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedThread = useMemo(
    () => threads.find((t) => t.id === selectedThreadId) ?? null,
    [threads, selectedThreadId],
  );

  // Auto-login from saved code
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) void loginWithCode(saved, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pollData = useCallback(async () => {
    if (!agentCode) return;
    try {
      const liveThreads = await agentFetch<LiveChatThread[]>("/agent-portal/chat-threads/", agentCode);
      setThreads(liveThreads);
    } catch {
      // ignore
    }
  }, [agentCode]);

  const pollThreadMessages = useCallback(async () => {
    if (!agentCode || !selectedThreadId) return;
    try {
      const messages = await agentFetch<LiveChatMessage[]>(
        `/agent-portal/chat-threads/${selectedThreadId}/messages/`,
        agentCode,
      );
      setThreadMessages(messages);
    } catch {
      // ignore
    }
  }, [agentCode, selectedThreadId]);

  useEffect(() => {
    if (!agentCode || !agent) return;
    pollTimerRef.current = setInterval(() => {
      void pollData();
      void pollThreadMessages();
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [agentCode, agent, pollData, pollThreadMessages]);

  async function loginWithCode(code: string, showErrors = true) {
    const normalizedCode = normalizeAgentCode(code);
    if (normalizedCode.length !== 7) {
      if (showErrors) setLoginError("Enter a valid code in format ABC-123.");
      return;
    }
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch(`${API_BASE}/agent-portal/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalizedCode }),
      });
      if (!res.ok) {
        if (showErrors) {
          setLoginError("Invalid agent code. Please try again.");
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
        return;
      }
      const info = (await res.json()) as AgentInfo;
      setAgent(info);
      setAgentCode(normalizedCode);
      window.localStorage.setItem(STORAGE_KEY, normalizedCode);
      await loadDashboard(normalizedCode);
    } catch {
      if (showErrors) setLoginError("Could not reach server. Is the backend running?");
    } finally {
      setLoggingIn(false);
    }
  }

  async function loadDashboard(code: string) {
    setLoadingData(true);
    setDataError("");
    try {
      const [props, msgs, liveThreads] = await Promise.all([
        agentFetch<PropertyItem[]>("/agent-portal/properties/", code),
        agentFetch<{ contacts: ContactItem[]; chats: unknown[] }>("/agent-portal/messages/", code),
        agentFetch<LiveChatThread[]>("/agent-portal/chat-threads/", code),
      ]);
      setProperties(props);
      setContacts(msgs.contacts);
      setThreads(liveThreads);
      if (liveThreads.length > 0) {
        const firstId = liveThreads[0].id;
        setSelectedThreadId(firstId);
        await loadThreadMessages(firstId, code);
      } else {
        setSelectedThreadId(null);
        setThreadMessages([]);
      }
    } catch {
      setDataError("Failed to load dashboard data.");
    } finally {
      setLoadingData(false);
    }
  }

  async function loadThreadMessages(threadId: number, code: string) {
    try {
      const messages = await agentFetch<LiveChatMessage[]>(
        `/agent-portal/chat-threads/${threadId}/messages/`,
        code,
      );
      setThreadMessages(messages);
    } catch {
      setThreadMessages([]);
    }
  }

  function signOut() {
    window.localStorage.removeItem(STORAGE_KEY);
    setAgent(null);
    setAgentCode("");
    setCodeInput("");
    setProperties([]);
    setContacts([]);
    setThreads([]);
    setSelectedThreadId(null);
    setThreadMessages([]);
    setReplyText("");
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
  }

  async function sendAgentMessage() {
    const text = replyText.trim();
    if (!text || !selectedThreadId || !agentCode) return;
    setReplyText("");
    try {
      const res = await fetch(
        `${API_BASE}/agent-portal/chat-threads/${selectedThreadId}/reply/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Agent-Code": agentCode },
          body: JSON.stringify({ text }),
        },
      );
      if (res.ok) {
        const msg = (await res.json()) as LiveChatMessage;
        setThreadMessages((prev) => [...prev, msg]);
      }
    } catch {
      setReplyText(text);
    }
  }

  if (!agent) {
    return (
      <section className="min-h-screen bg-beige-light px-4 py-20">
        <div className="mx-auto max-w-md bg-white border border-beige-dark/40 p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-accent text-white">
              <FeatherIcon icon="user" size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Agent Access</p>
              <h1 className="text-2xl font-bold text-accent">Agent Portal</h1>
            </div>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-muted">
            Enter your unique agent code to access your listings and direct customer chat.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void loginWithCode(codeInput);
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="agent-code" className="mb-1.5 block text-sm font-medium text-accent">
                Agent Code
              </label>
              <input
                id="agent-code"
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(normalizeAgentCode(e.target.value))}
                className="w-full border border-beige-dark/50 bg-white px-4 py-3 text-sm font-mono tracking-widest focus:border-accent focus:outline-none uppercase"
                placeholder="ABC-123"
                maxLength={7}
                autoComplete="off"
              />
            </div>
            {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
            <button
              type="submit"
              disabled={loggingIn || normalizeAgentCode(codeInput).length !== 7}
              className="inline-flex w-full items-center justify-center gap-2 bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-light disabled:opacity-60"
            >
              <FeatherIcon icon="log-in" size={16} />
              {loggingIn ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-beige-light px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 border border-beige-dark/30 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {agent.image ? (
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-beige-dark/30">
                <Image src={agent.image} alt={agent.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-beige text-accent">
                <FeatherIcon icon="user" size={24} />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Agent Portal</p>
              <h1 className="text-xl font-bold text-accent">{agent.name}</h1>
              <p className="flex items-center gap-2 text-sm text-muted">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Live chat active
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => void loadDashboard(agentCode)}
              className="inline-flex items-center gap-2 border border-beige-dark/50 px-4 py-2 text-sm text-accent transition-colors hover:bg-beige"
            >
              <FeatherIcon icon="refresh-cw" size={14} />
              Refresh
            </button>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 bg-accent px-4 py-2 text-sm text-white transition-colors hover:bg-accent-light"
            >
              <FeatherIcon icon="log-out" size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {dataError ? <p className="text-sm text-red-600">{dataError}</p> : null}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "My Listings", value: properties.length, icon: "home" },
            { label: "Contact Forms", value: contacts.length, icon: "mail" },
            { label: "Live Chat Threads", value: threads.length, icon: "message-circle" },
          ].map((s) => (
            <div key={s.label} className="border border-beige-dark/30 bg-white p-4 text-center shadow-sm">
              <FeatherIcon icon={s.icon} size={20} className="mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-accent">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(["listings", "messages"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-accent text-white"
                  : "border border-beige-dark/40 bg-white text-accent hover:bg-beige"
              }`}
            >
              {t === "listings" ? "My Listings" : "Messages & Live Chat"}
            </button>
          ))}
        </div>

        {loadingData ? <p className="text-sm text-muted">Loading...</p> : null}

        {/* Listings tab */}
        {tab === "listings" && !loadingData ? (
          properties.length === 0 ? (
            <div className="border border-beige-dark/30 bg-white p-12 text-center shadow-sm">
              <FeatherIcon icon="home" size={40} className="mx-auto mb-3 text-beige-dark" />
              <p className="font-semibold text-accent">No listings assigned yet</p>
              <p className="mt-1 text-sm text-muted">Contact the admin to be assigned to a property.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {properties.map((p) => (
                <a
                  key={p.id}
                  href={`/listings/${p.id}`}
                  className="group block border border-beige-dark/30 bg-white shadow-sm transition-shadow hover:shadow-md"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-accent">{p.title}</p>
                    <p className="mt-1 text-sm text-muted">
                      {p.address}, {p.city}, {p.state}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-accent">
                        {formatPrice(typeof p.price === "string" ? parseFloat(p.price) : p.price)}
                      </span>
                      <span className="flex items-center gap-3 text-xs text-muted">
                        <span>{p.bedrooms} bd</span>
                        <span>{p.bathrooms} ba</span>
                        <span>{p.sqft.toLocaleString()} sqft</span>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )
        ) : null}

        {/* Messages tab */}
        {tab === "messages" && !loadingData ? (
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            {/* Left column */}
            <div className="space-y-6">
              <div className="border border-beige-dark/30 bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-base font-semibold text-accent">Live Chat Threads</h2>
                {threads.length === 0 ? (
                  <p className="text-sm text-muted">No live chat threads yet.</p>
                ) : (
                  <div className="space-y-2">
                    {threads.map((thread) => (
                      <button
                        key={thread.id}
                        onClick={() => {
                          setSelectedThreadId(thread.id);
                          void loadThreadMessages(thread.id, agentCode);
                        }}
                        className={`w-full border px-3 py-3 text-left transition-colors ${
                          selectedThreadId === thread.id
                            ? "border-accent bg-beige-light"
                            : "border-beige-dark/30 hover:bg-beige-light"
                        }`}
                      >
                        <p className="text-sm font-semibold text-accent">{thread.propertyTitle}</p>
                        <p className="mt-1 text-xs text-muted">Visitor: {thread.userIp}</p>
                        <p className="mt-2 line-clamp-2 text-xs text-muted">
                          {thread.lastMessage?.text ?? "No messages yet"}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-beige-dark/30 bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-base font-semibold text-accent">
                  Contact Form Submissions ({contacts.length})
                </h2>
                {contacts.length === 0 ? (
                  <p className="text-sm text-muted">No contact messages yet.</p>
                ) : (
                  <div className="space-y-3">
                    {contacts.slice(0, 8).map((c) => (
                      <div key={c.id} className="border border-beige-dark/20 p-3">
                        <p className="text-sm font-semibold text-accent">
                          {c.first_name} {c.last_name}
                        </p>
                        <p className="text-xs text-muted">{c.email}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted">{c.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Thread detail */}
            <div className="border border-beige-dark/30 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-accent">
                {selectedThread
                  ? `Conversation: ${selectedThread.propertyTitle}`
                  : "Select a thread"}
              </h2>

              {selectedThread ? (
                <>
                  <div className="mb-4 h-[420px] space-y-3 overflow-y-auto border border-beige-dark/20 p-3">
                    {threadMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "agent" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] px-4 py-2 text-sm ${
                            message.sender === "agent"
                              ? "bg-accent text-white"
                              : "bg-beige text-accent"
                          }`}
                        >
                          <p>{message.text}</p>
                          <p
                            className={`mt-1 text-xs ${
                              message.sender === "agent" ? "text-white/70" : "text-muted"
                            }`}
                          >
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void sendAgentMessage();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 border border-beige-dark/50 px-4 py-2 text-sm focus:border-accent focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="inline-flex items-center gap-2 bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-light disabled:opacity-60"
                    >
                      <FeatherIcon icon="send" size={14} />
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <p className="text-sm text-muted">Choose a live chat thread from the left panel.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
