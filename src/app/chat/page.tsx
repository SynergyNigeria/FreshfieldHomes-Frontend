"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import FeatherIcon from "feather-icons-react";
import { Agent, ChatMessage } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";
const POLL_INTERVAL_MS = 3000;
const DEFAULT_AGENT_IMAGE =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop";

type ApiMessage = {
  id: number;
  sender: "user" | "agent";
  text: string;
  created_at: string;
};

type StartChatResponse = {
  thread_id: number;
  agent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    image: string;
  };
};

function toUiMessage(message: ApiMessage): ChatMessage {
  return {
    id: String(message.id),
    sender: message.sender,
    text: message.text,
    timestamp: new Date(message.created_at),
  };
}

function ChatContent() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const selectedPropertyTitle = searchParams.get("propertyTitle");

  const [agent, setAgent] = useState<Agent>({
    id: "agent",
    name: "Fresh Fields Agent",
    phone: "",
    email: "hello@freshfieldshomes.com",
    image: DEFAULT_AGENT_IMAGE,
  });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "placeholder",
      sender: "agent",
      text: "Connecting you to the listing agent...",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!propertyId) {
      setThreadId(null);
      return;
    }

    let cancelled = false;

    async function startThread() {
      try {
        const response = await fetch(`${API_BASE}/chat/start/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ property_id: propertyId }),
        });

        if (!response.ok || cancelled) {
          return;
        }

        const data = (await response.json()) as StartChatResponse;
        const resolvedAgent: Agent = {
          id: data.agent.id,
          name: data.agent.name,
          phone: data.agent.phone,
          email: data.agent.email,
          image: data.agent.image || DEFAULT_AGENT_IMAGE,
        };

        const openingText = selectedPropertyTitle
          ? `Hi there! I'm ${resolvedAgent.name}, the listing agent for ${selectedPropertyTitle}. Send me a message and I'll reply here.`
          : `Hi there! I'm ${resolvedAgent.name}, your Fresh Fields Homes specialist. Send me a message and I'll reply here.`;

        setAgent(resolvedAgent);
        setThreadId(data.thread_id);
        lastMessageIdRef.current = 0;
        setMessages([
          {
            id: "placeholder",
            sender: "agent",
            text: openingText,
            timestamp: new Date(),
          },
        ]);
      } catch {
        // Keep fallback UI if the backend is unavailable.
      }
    }

    void startThread();

    return () => {
      cancelled = true;
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [propertyId, selectedPropertyTitle]);

  const pollMessages = useCallback(async () => {
    if (!threadId) {
      return;
    }

    try {
      const since = lastMessageIdRef.current;
      const query = since ? `?since=${since}` : "";
      const response = await fetch(`${API_BASE}/chat/${threadId}/messages/${query}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as ApiMessage[];
      if (data.length === 0) {
        return;
      }

      lastMessageIdRef.current = data[data.length - 1].id;
      const nextMessages = data.map(toUiMessage);

      setMessages((current) => {
        const withoutPlaceholder = current.filter((message) => message.id !== "placeholder");
        return [...withoutPlaceholder, ...nextMessages];
      });
    } catch {
      // Ignore transient polling failures.
    }
  }, [threadId]);

  useEffect(() => {
    if (!threadId) {
      return;
    }

    void pollMessages();
    pollTimerRef.current = setInterval(() => {
      void pollMessages();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [threadId, pollMessages]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();
    if (!text || !threadId || sending) {
      return;
    }

    setSending(true);
    setInput("");

    try {
      const response = await fetch(`${API_BASE}/chat/${threadId}/send/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        setInput(text);
        return;
      }

      const message = (await response.json()) as ApiMessage;
      lastMessageIdRef.current = Math.max(lastMessageIdRef.current, message.id);
      setMessages((current) => {
        const withoutPlaceholder = current.filter((item) => item.id !== "placeholder");
        return [...withoutPlaceholder, toUiMessage(message)];
      });
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  const connected = threadId !== null;

  return (
    <>
      <section className="border-b border-beige-dark/30 bg-beige-light py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image src={agent.image} alt={agent.name} fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-accent">Live Chat</h1>
              <p className="flex items-center gap-2 text-sm text-muted">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-yellow-500"}`}
                />
                {connected ? `${agent.name} is online` : "Connecting to live chat..."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto flex max-w-4xl flex-col px-4 py-6 sm:px-6 lg:px-8"
        style={{ minHeight: "calc(100vh - 300px)" }}
      >
        {!propertyId ? (
          <p className="mb-6 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Open chat from a specific listing so we can connect you to the correct agent.
          </p>
        ) : null}

        <div className="mb-6 flex-1 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md px-5 py-3 text-sm leading-relaxed ${
                  message.sender === "user" ? "bg-accent text-white" : "bg-beige text-accent"
                }`}
              >
                {message.text}
                <p
                  className={`mt-2 text-xs ${
                    message.sender === "user" ? "text-white/50" : "text-muted"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={connected ? "Type your message..." : "Connecting chat..."}
            className="flex-1 border border-beige-dark/50 bg-white px-5 py-3 text-sm focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="bg-accent px-6 py-3 text-white transition-colors duration-200 hover:bg-accent-light disabled:opacity-60"
            disabled={!connected || !input.trim() || sending}
          >
            <FeatherIcon icon="send" size={18} />
          </button>
        </form>
      </section>
    </>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatContent />
    </Suspense>
  );
}
