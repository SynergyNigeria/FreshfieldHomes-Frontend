"use client";

import { useEffect, useState } from "react";
import FeatherIcon from "feather-icons-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";
const OWNER_CODE_STORAGE_KEY = "fresh-fields-owner-admin-code";

type AdminSection = "overview" | "properties" | "partialHomes" | "agents" | "leads";
type PropertyType = "house" | "apartment" | "condo" | "townhouse";
type PropertyStatus = "for-sale" | "pending" | "sold";
type LeadStatus = "new" | "read" | "replied";
type CounterRequestStatus = "new" | "contacted" | "closed";

interface AgentItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  image: string;
  agent_code?: string;
}

interface PropertyItem {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: string | number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image: string;
  images: string[];
  type: PropertyType;
  status: PropertyStatus;
  yearBuilt: number;
  description: string;
  features: string[];
  agent: AgentItem;
  is_featured?: boolean;
}

interface PartialHomeItem {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  fullPrice: string | number;
  amountPaid: string | number;
  remainingAmount: string | number;
  percentagePaid: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image: string;
  images: string[];
  type: PropertyType;
  yearBuilt: number;
  description: string;
  features: string[];
  payerName?: string;
  payerAmountPaid?: string | number;
  payerDatePaid?: string;
  payerPercentagePaid?: number;
  secureCode?: string;
  agent: AgentItem;
  is_active?: boolean;
}

interface ContactMessageItem {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: LeadStatus;
  created_at: string;
}

interface CounterPayRequestItem {
  id: number;
  partialHomeId: string;
  partialHomeTitle: string;
  email: string;
  status: CounterRequestStatus;
  notes: string;
  created_at: string;
}

interface ChatInquiryItem {
  id: number;
  email: string;
  message: string;
  source: string;
  created_at: string;
}

interface AgentFormState {
  id: string;
  name: string;
  phone: string;
  email: string;
  image: string;
  agent_code: string;
}

interface PropertyFormState {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  image: string;
  imagesText: string;
  type: PropertyType;
  status: PropertyStatus;
  yearBuilt: string;
  description: string;
  featuresText: string;
  agentId: string;
  isFeatured: boolean;
}

interface PartialHomeFormState {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  fullPrice: string;
  amountPaid: string;
  remainingAmount: string;
  percentagePaid: string;
  bedrooms: string;
  bathrooms: string;
  sqft: string;
  image: string;
  imagesText: string;
  type: PropertyType;
  yearBuilt: string;
  description: string;
  featuresText: string;
  payerName: string;
  payerAmountPaid: string;
  payerDatePaid: string;
  payerPercentagePaid: string;
  secureCode: string;
  agentId: string;
  isActive: boolean;
}

const blankAgentForm = (): AgentFormState => ({
  id: "",
  name: "",
  phone: "",
  email: "",
  image: "",
  agent_code: "",
});

const blankPropertyForm = (): PropertyFormState => ({
  id: "",
  title: "",
  address: "",
  city: "",
  state: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  image: "",
  imagesText: "",
  type: "house",
  status: "for-sale",
  yearBuilt: "",
  description: "",
  featuresText: "",
  agentId: "",
  isFeatured: false,
});

const blankPartialHomeForm = (): PartialHomeFormState => ({
  id: "",
  title: "",
  address: "",
  city: "",
  state: "",
  fullPrice: "",
  amountPaid: "",
  remainingAmount: "",
  percentagePaid: "",
  bedrooms: "",
  bathrooms: "",
  sqft: "",
  image: "",
  imagesText: "",
  type: "house",
  yearBuilt: "",
  description: "",
  featuresText: "",
  payerName: "",
  payerAmountPaid: "",
  payerDatePaid: "",
  payerPercentagePaid: "",
  secureCode: "1998runs",
  agentId: "",
  isActive: true,
});

function toLines(values: string[]) {
  return values.join("\n");
}

function splitTextValues(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toAgentForm(agent: AgentItem): AgentFormState {
  return {
    id: agent.id,
    name: agent.name,
    phone: agent.phone,
    email: agent.email,
    image: agent.image,
    agent_code: agent.agent_code ?? "",
  };
}

function toPropertyForm(property: PropertyItem): PropertyFormState {
  return {
    id: property.id,
    title: property.title,
    address: property.address,
    city: property.city,
    state: property.state,
    price: String(property.price),
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    sqft: String(property.sqft),
    image: property.image,
    imagesText: toLines(property.images),
    type: property.type,
    status: property.status,
    yearBuilt: String(property.yearBuilt),
    description: property.description,
    featuresText: toLines(property.features),
    agentId: property.agent.id,
    isFeatured: Boolean(property.is_featured),
  };
}

function toPartialHomeForm(home: PartialHomeItem): PartialHomeFormState {
  return {
    id: home.id,
    title: home.title,
    address: home.address,
    city: home.city,
    state: home.state,
    fullPrice: String(home.fullPrice),
    amountPaid: String(home.amountPaid),
    remainingAmount: String(home.remainingAmount),
    percentagePaid: String(home.percentagePaid),
    bedrooms: String(home.bedrooms),
    bathrooms: String(home.bathrooms),
    sqft: String(home.sqft),
    image: home.image,
    imagesText: toLines(home.images),
    type: home.type,
    yearBuilt: String(home.yearBuilt),
    description: home.description,
    featuresText: toLines(home.features),
    payerName: home.payerName ?? "",
    payerAmountPaid: String(home.payerAmountPaid ?? ""),
    payerDatePaid: home.payerDatePaid ?? "",
    payerPercentagePaid: String(home.payerPercentagePaid ?? ""),
    secureCode: home.secureCode ?? "1998runs",
    agentId: home.agent.id,
    isActive: Boolean(home.is_active ?? true),
  };
}

async function apiRequest<T>(path: string, init: RequestInit = {}, ownerCode?: string): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (ownerCode) {
    headers.set("X-Admin-Code", ownerCode);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = "Request failed.";
    try {
      const data = (await response.json()) as Record<string, unknown>;
      if (typeof data.detail === "string") {
        detail = data.detail;
      } else {
        detail = JSON.stringify(data);
      }
    } catch {
      detail = response.statusText || detail;
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export default function OwnerAdminPage() {
  const [section, setSection] = useState<AdminSection>("overview");
  const [ownerCodeInput, setOwnerCodeInput] = useState("");
  const [ownerCode, setOwnerCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [partialHomes, setPartialHomes] = useState<PartialHomeItem[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessageItem[]>([]);
  const [counterRequests, setCounterRequests] = useState<CounterPayRequestItem[]>([]);
  const [chatInquiries, setChatInquiries] = useState<ChatInquiryItem[]>([]);

  const [uploadingPropMain, setUploadingPropMain] = useState(false);
  const [uploadingPropGallery, setUploadingPropGallery] = useState(false);
  const [uploadingPartialMain, setUploadingPartialMain] = useState(false);
  const [uploadingPartialGallery, setUploadingPartialGallery] = useState(false);
    const [uploadingAgent, setUploadingAgent] = useState(false);

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedPartialHomeId, setSelectedPartialHomeId] = useState<string | null>(null);

  const [agentForm, setAgentForm] = useState<AgentFormState>(blankAgentForm());
  const [propertyForm, setPropertyForm] = useState<PropertyFormState>(blankPropertyForm());
  const [partialHomeForm, setPartialHomeForm] = useState<PartialHomeFormState>(blankPartialHomeForm());

  useEffect(() => {
    const saved = window.localStorage.getItem(OWNER_CODE_STORAGE_KEY) ?? "";
    if (saved) {
      setOwnerCode(saved);
      setOwnerCodeInput(saved);
    }
  }, []);

  useEffect(() => {
    if (ownerCode) {
      void loadDashboard(ownerCode);
    }
  }, [ownerCode]);

  async function loadDashboard(code: string) {
    setLoading(true);
    setAccessError("");
    setMessage("");
    try {
      const [agentsData, propertiesData, partialHomesData, contactsData, counterData, chatData] =
        await Promise.all([
          apiRequest<AgentItem[]>("/agents/", {}, code),
          apiRequest<PropertyItem[]>("/properties/", {}, code),
          apiRequest<PartialHomeItem[]>("/partial-homes/", {}, code),
          apiRequest<ContactMessageItem[]>("/contact-messages/", {}, code),
          apiRequest<CounterPayRequestItem[]>("/counter-pay-requests/", {}, code),
          apiRequest<ChatInquiryItem[]>("/chat-inquiries/", {}, code),
        ]);

      setAgents(agentsData);
      setProperties(propertiesData);
      setPartialHomes(partialHomesData);
      setContactMessages(contactsData);
      setCounterRequests(counterData);
      setChatInquiries(chatData);

      if (agentsData.length > 0 && !selectedAgentId) {
        setSelectedAgentId(agentsData[0].id);
        setAgentForm(toAgentForm(agentsData[0]));
      }

      if (propertiesData.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(propertiesData[0].id);
        setPropertyForm(toPropertyForm(propertiesData[0]));
      }

      if (partialHomesData.length > 0 && !selectedPartialHomeId) {
        setSelectedPartialHomeId(partialHomesData[0].id);
        setPartialHomeForm(toPartialHomeForm(partialHomesData[0]));
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unable to load owner dashboard.";
      setAccessError(detail);
      window.localStorage.removeItem(OWNER_CODE_STORAGE_KEY);
      setOwnerCode("");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!ownerCodeInput.trim()) {
      setAccessError("Enter the owner admin code.");
      return;
    }

    setLoading(true);
    setAccessError("");
    try {
      await apiRequest<AgentItem[]>("/agents/", {}, ownerCodeInput.trim());
      window.localStorage.setItem(OWNER_CODE_STORAGE_KEY, ownerCodeInput.trim());
      setOwnerCode(ownerCodeInput.trim());
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Access denied.");
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    window.localStorage.removeItem(OWNER_CODE_STORAGE_KEY);
    setOwnerCode("");
    setOwnerCodeInput("");
    setAccessError("");
    setMessage("");
  }

  async function uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    const result = await apiRequest<{ urls: string[] }>(
      "/upload-images/",
      { method: "POST", body: formData },
      ownerCode,
    );
    return result.urls;
  }

  function selectAgent(agent: AgentItem) {
    setSelectedAgentId(agent.id);
    setAgentForm(toAgentForm(agent));
    setSection("agents");
  }

  function selectProperty(property: PropertyItem) {
    setSelectedPropertyId(property.id);
    setPropertyForm(toPropertyForm(property));
    setSection("properties");
  }

  function selectPartialHome(home: PartialHomeItem) {
    setSelectedPartialHomeId(home.id);
    setPartialHomeForm(toPartialHomeForm(home));
    setSection("partialHomes");
  }

  async function saveAgent() {
    if (!ownerCode) return;
    setSaving(true);
    setMessage("");
    try {
      const isNew = selectedAgentId === null;
      const path = isNew ? "/agents/" : `/agents/${selectedAgentId}/`;
      const method = isNew ? "POST" : "PATCH";
      const savedAgent = await apiRequest<AgentItem>(
        path,
        {
          method,
          body: JSON.stringify(agentForm),
        },
        ownerCode,
      );
      await loadDashboard(ownerCode);
      setSelectedAgentId(savedAgent.id);
      setAgentForm(toAgentForm(savedAgent));
      setMessage(`Agent ${isNew ? "created" : "updated"} successfully.`);
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Unable to save agent.");
    } finally {
      setSaving(false);
    }
  }

  async function saveProperty() {
    if (!ownerCode) return;
    setSaving(true);
    setMessage("");
    try {
      const isNew = selectedPropertyId === null;
      const path = isNew ? "/properties/" : `/properties/${selectedPropertyId}/`;
      const method = isNew ? "POST" : "PATCH";
      const payload = {
        id: propertyForm.id,
        title: propertyForm.title,
        address: propertyForm.address,
        city: propertyForm.city,
        state: propertyForm.state,
        price: Number(propertyForm.price),
        bedrooms: Number(propertyForm.bedrooms),
        bathrooms: Number(propertyForm.bathrooms),
        sqft: Number(propertyForm.sqft),
        image: propertyForm.image,
        imageUrls: splitTextValues(propertyForm.imagesText),
        type: propertyForm.type,
        status: propertyForm.status,
        yearBuilt: Number(propertyForm.yearBuilt),
        description: propertyForm.description,
        featureNames: splitTextValues(propertyForm.featuresText),
        agentId: propertyForm.agentId,
        is_featured: propertyForm.isFeatured,
      };
      const savedProperty = await apiRequest<PropertyItem>(
        path,
        {
          method,
          body: JSON.stringify(payload),
        },
        ownerCode,
      );
      await loadDashboard(ownerCode);
      setSelectedPropertyId(savedProperty.id);
      setPropertyForm(toPropertyForm(savedProperty));
      setMessage(`Property ${isNew ? "created" : "updated"} successfully.`);
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Unable to save property.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteProperty() {
    if (!ownerCode || !selectedPropertyId) return;

    const confirmed = window.confirm("Delete this property permanently? This cannot be undone.");
    if (!confirmed) return;

    setSaving(true);
    setMessage("");
    try {
      const remaining = properties.filter((property) => property.id !== selectedPropertyId);

      await apiRequest<void>(
        `/properties/${selectedPropertyId}/`,
        { method: "DELETE" },
        ownerCode,
      );

      await loadDashboard(ownerCode);

      if (remaining.length > 0) {
        setSelectedPropertyId(remaining[0].id);
        setPropertyForm(toPropertyForm(remaining[0]));
      } else {
        setSelectedPropertyId(null);
        setPropertyForm(blankPropertyForm());
      }

      setMessage("Property deleted successfully.");
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Unable to delete property.");
    } finally {
      setSaving(false);
    }
  }

  async function savePartialHome() {
    if (!ownerCode) return;
    setSaving(true);
    setMessage("");
    try {
      const isNew = selectedPartialHomeId === null;
      const path = isNew ? "/partial-homes/" : `/partial-homes/${selectedPartialHomeId}/`;
      const method = isNew ? "POST" : "PATCH";
      const payload = {
        id: partialHomeForm.id,
        title: partialHomeForm.title,
        address: partialHomeForm.address,
        city: partialHomeForm.city,
        state: partialHomeForm.state,
        fullPrice: Number(partialHomeForm.fullPrice),
        amountPaid: Number(partialHomeForm.amountPaid),
        remainingAmount: Number(partialHomeForm.remainingAmount),
        percentagePaid: Number(partialHomeForm.percentagePaid),
        bedrooms: Number(partialHomeForm.bedrooms),
        bathrooms: Number(partialHomeForm.bathrooms),
        sqft: Number(partialHomeForm.sqft),
        image: partialHomeForm.image,
        imageUrls: splitTextValues(partialHomeForm.imagesText),
        type: partialHomeForm.type,
        yearBuilt: Number(partialHomeForm.yearBuilt),
        description: partialHomeForm.description,
        featureNames: splitTextValues(partialHomeForm.featuresText),
        payerName: partialHomeForm.payerName,
        payerAmountPaid: Number(partialHomeForm.payerAmountPaid),
        payerDatePaid: partialHomeForm.payerDatePaid,
        payerPercentagePaid: Number(partialHomeForm.payerPercentagePaid),
        secureCode: partialHomeForm.secureCode,
        agentId: partialHomeForm.agentId,
        is_active: partialHomeForm.isActive,
      };
      const savedHome = await apiRequest<PartialHomeItem>(
        path,
        {
          method,
          body: JSON.stringify(payload),
        },
        ownerCode,
      );
      await loadDashboard(ownerCode);
      setSelectedPartialHomeId(savedHome.id);
      setPartialHomeForm(toPartialHomeForm(savedHome));
      setMessage(`Partial home ${isNew ? "created" : "updated"} successfully.`);
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Unable to save partial home.");
    } finally {
      setSaving(false);
    }
  }

  async function updateContactStatus(id: number, status: LeadStatus) {
    if (!ownerCode) return;
    setSaving(true);
    try {
      await apiRequest<ContactMessageItem>(
        `/contact-messages/${id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
        ownerCode,
      );
      await loadDashboard(ownerCode);
      setMessage("Contact message updated.");
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Unable to update message.");
    } finally {
      setSaving(false);
    }
  }

  async function updateCounterRequest(item: CounterPayRequestItem) {
    if (!ownerCode) return;
    setSaving(true);
    try {
      await apiRequest<CounterPayRequestItem>(
        `/counter-pay-requests/${item.id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: item.status, notes: item.notes }),
        },
        ownerCode,
      );
      await loadDashboard(ownerCode);
      setMessage("Counter pay request updated.");
    } catch (error) {
      setAccessError(error instanceof Error ? error.message : "Unable to update counter request.");
    } finally {
      setSaving(false);
    }
  }

  if (!ownerCode) {
    return (
      <section className="min-h-screen bg-beige-light px-4 py-20">
        <div className="mx-auto max-w-xl bg-white border border-beige-dark/40 p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-accent text-white">
              <FeatherIcon icon="shield" size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Owner Access</p>
              <h1 className="text-2xl font-bold text-accent">Fresh Fields Owner Admin</h1>
            </div>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-muted">
            Enter the owner admin code to manage listings, agents, partial-payment homes,
            and incoming leads from the website.
          </p>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label htmlFor="owner-code" className="mb-1.5 block text-sm font-medium text-accent">
                Owner Admin Code
              </label>
              <input
                id="owner-code"
                type="password"
                value={ownerCodeInput}
                onChange={(e) => setOwnerCodeInput(e.target.value)}
                className="w-full border border-beige-dark/50 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"
                placeholder="Enter access code"
              />
            </div>
            {accessError ? <p className="text-sm text-red-600">{accessError}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-light disabled:opacity-70"
            >
              <FeatherIcon icon="unlock" size={16} />
              {loading ? "Checking access..." : "Open Owner Admin"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-beige-light px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 border border-beige-dark/30 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Owner Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold text-accent">Manage Fresh Fields Homes</h1>
            <p className="mt-2 text-sm text-muted">
              Update core site content from one place. Backend source: {API_BASE}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => void loadDashboard(ownerCode)}
              className="inline-flex items-center gap-2 border border-beige-dark/50 px-4 py-2.5 text-sm text-accent transition-colors hover:bg-beige"
            >
              <FeatherIcon icon="refresh-cw" size={15} />
              Refresh
            </button>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-sm text-white transition-colors hover:bg-accent-light"
            >
              <FeatherIcon icon="log-out" size={15} />
              Sign Out
            </button>
          </div>
        </div>

        {accessError ? <p className="text-sm text-red-600">{accessError}</p> : null}
        {message ? <p className="text-sm text-green-700">{message}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Agents", value: agents.length, icon: "users" },
            { label: "Properties", value: properties.length, icon: "home" },
            { label: "Partial Homes", value: partialHomes.length, icon: "layers" },
            {
              label: "Open Leads",
              value: contactMessages.length + counterRequests.length + chatInquiries.length,
              icon: "inbox",
            },
          ].map((card) => (
            <div key={card.label} className="border border-beige-dark/30 bg-white p-5 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center bg-beige text-accent">
                <FeatherIcon icon={card.icon} size={18} />
              </div>
              <p className="text-sm text-muted">{card.label}</p>
              <p className="mt-1 text-3xl font-bold text-accent">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ["overview", "Overview"],
            ["properties", "Properties"],
            ["partialHomes", "Partial Homes"],
            ["agents", "Agents"],
            ["leads", "Leads"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSection(value as AdminSection)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                section === value ? "bg-accent text-white" : "bg-white text-accent border border-beige-dark/40 hover:bg-beige"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? <p className="text-sm text-muted">Loading dashboard data...</p> : null}

        {section === "overview" ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="border border-beige-dark/30 bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="text-xl font-semibold text-accent">Owner Actions</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: "Add a new listing",
                    desc: "Create or update the public homes shown on the landing page and listings page.",
                    action: () => {
                      setSelectedPropertyId(null);
                      setPropertyForm(blankPropertyForm());
                      setSection("properties");
                    },
                  },
                  {
                    title: "Manage partial homes",
                    desc: "Adjust partial payment details, secure code, and owner information.",
                    action: () => {
                      setSelectedPartialHomeId(null);
                      setPartialHomeForm(blankPartialHomeForm());
                      setSection("partialHomes");
                    },
                  },
                  {
                    title: "Update agents",
                    desc: "Edit agent names, contact info, and profile photos used across the site.",
                    action: () => {
                      setSelectedAgentId(null);
                      setAgentForm(blankAgentForm());
                      setSection("agents");
                    },
                  },
                  {
                    title: "Review leads",
                    desc: "Track contact submissions, counter-pay requests, and chat inquiries in one place.",
                    action: () => setSection("leads"),
                  },
                ].map((item) => (
                  <button
                    key={item.title}
                    onClick={item.action}
                    className="border border-beige-dark/40 bg-beige-light p-5 text-left transition-colors hover:bg-beige"
                  >
                    <p className="font-semibold text-accent">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="border border-beige-dark/30 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-accent">Quick Summary</h2>
              <div className="mt-5 space-y-3 text-sm text-muted">
                <div className="flex items-center justify-between border-b border-beige-dark/20 pb-3">
                  <span>Newest contact messages</span>
                  <span className="font-semibold text-accent">{contactMessages.slice(0, 3).length}</span>
                </div>
                <div className="flex items-center justify-between border-b border-beige-dark/20 pb-3">
                  <span>Pending counter-pay follow-up</span>
                  <span className="font-semibold text-accent">
                    {counterRequests.filter((item) => item.status !== "closed").length}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span>Chat inquiries captured</span>
                  <span className="font-semibold text-accent">{chatInquiries.length}</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {section === "agents" ? (
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="border border-beige-dark/30 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-accent">Agents</h2>
                <button
                  onClick={() => {
                    setSelectedAgentId(null);
                    setAgentForm(blankAgentForm());
                  }}
                  className="text-sm text-accent underline"
                >
                  New
                </button>
              </div>
              <div className="space-y-2">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => selectAgent(agent)}
                    className={`w-full border px-4 py-3 text-left transition-colors ${
                      selectedAgentId === agent.id
                        ? "border-accent bg-beige-light"
                        : "border-beige-dark/30 hover:bg-beige-light"
                    }`}
                  >
                    <p className="font-medium text-accent">{agent.name}</p>
                    <p className="mt-1 text-xs text-muted">{agent.email}</p>
                    {agent.agent_code ? (
                      <p className="mt-1 font-mono text-xs tracking-widest text-muted">{agent.agent_code}</p>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
            <div className="border border-beige-dark/30 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-accent">
                {selectedAgentId ? "Edit Agent" : "Create Agent"}
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="text-sm text-accent">
                  Public ID
                  <input
                    value={agentForm.id}
                    onChange={(e) => setAgentForm((prev) => ({ ...prev, id: e.target.value }))}
                    className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  />
                </label>
                <label className="text-sm text-accent">
                  Name
                  <input
                    value={agentForm.name}
                    onChange={(e) => setAgentForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  />
                </label>
                <label className="text-sm text-accent">
                  Phone
                  <input
                    value={agentForm.phone}
                    onChange={(e) => setAgentForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  />
                </label>
                <label className="text-sm text-accent">
                  Email
                  <input
                    type="email"
                    value={agentForm.email}
                    onChange={(e) => setAgentForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  />
                </label>
                <label className="text-sm text-accent">
                  Agent Login Code
                  <input
                    value={agentForm.agent_code}
                    onChange={(e) => setAgentForm((prev) => ({ ...prev, agent_code: e.target.value.toUpperCase().slice(0, 7) }))}
                    className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm font-mono tracking-widest focus:border-accent focus:outline-none uppercase"
                    placeholder="Auto-generated (e.g. ABC-123)"
                    maxLength={7}
                  />
                  <span className="mt-1 block text-xs text-muted">Leave blank to auto-generate on create. Must be unique.</span>
                </label>
                <div className="text-sm text-accent md:col-span-2">
                  <span>Profile Image</span>
                  <div className="mt-1.5 space-y-2">
                    {agentForm.image && (
                      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-beige-dark/30">
                        <img src={agentForm.image} alt="Agent preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (!e.target.files?.length || !ownerCode) return;
                        setUploadingAgent(true);
                        try {
                          const urls = await uploadImages(Array.from(e.target.files));
                          if (urls[0]) setAgentForm((prev) => ({ ...prev, image: urls[0] }));
                        } finally {
                          setUploadingAgent(false);
                        }
                      }}
                      className="w-full border border-beige-dark/50 px-4 py-2 text-sm focus:border-accent focus:outline-none"
                    />
                    {uploadingAgent && <p className="text-xs text-muted">Uploading...</p>}
                  </div>
                </div>
              </div>
              <button
                onClick={() => void saveAgent()}
                disabled={saving}
                className="mt-6 inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-light disabled:opacity-70"
              >
                <FeatherIcon icon="save" size={15} />
                {saving ? "Saving..." : selectedAgentId ? "Update Agent" : "Create Agent"}
              </button>
            </div>
          </div>
        ) : null}

        {section === "properties" ? (
          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="border border-beige-dark/30 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-accent">Properties</h2>
                <button
                  onClick={() => {
                    setSelectedPropertyId(null);
                    setPropertyForm(blankPropertyForm());
                  }}
                  className="text-sm text-accent underline"
                >
                  New
                </button>
              </div>
              <div className="space-y-2">
                {properties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => selectProperty(property)}
                    className={`w-full border px-4 py-3 text-left transition-colors ${
                      selectedPropertyId === property.id
                        ? "border-accent bg-beige-light"
                        : "border-beige-dark/30 hover:bg-beige-light"
                    }`}
                  >
                    <p className="font-medium text-accent">{property.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {property.city}, {property.state}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="border border-beige-dark/30 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-accent">
                {selectedPropertyId ? "Edit Property" : "Create Property"}
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="text-sm text-accent">
                  Public ID
                  <input value={propertyForm.id} onChange={(e) => setPropertyForm((prev) => ({ ...prev, id: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                </label>
                <label className="text-sm text-accent">
                  Title
                  <input value={propertyForm.title} onChange={(e) => setPropertyForm((prev) => ({ ...prev, title: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                </label>
                <label className="text-sm text-accent md:col-span-2">
                  Address
                  <input value={propertyForm.address} onChange={(e) => setPropertyForm((prev) => ({ ...prev, address: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                </label>
                <label className="text-sm text-accent">
                  City
                  <input value={propertyForm.city} onChange={(e) => setPropertyForm((prev) => ({ ...prev, city: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                </label>
                <label className="text-sm text-accent">
                  State
                  <input value={propertyForm.state} onChange={(e) => setPropertyForm((prev) => ({ ...prev, state: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                </label>
                <label className="text-sm text-accent">
                  Price
                  <input type="number" value={propertyForm.price} onChange={(e) => setPropertyForm((prev) => ({ ...prev, price: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                </label>
                <label className="text-sm text-accent">
                  Year Built
                  <input type="number" value={propertyForm.yearBuilt} onChange={(e) => setPropertyForm((prev) => ({ ...prev, yearBuilt: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                </label>
                <label className="text-sm text-accent">
                  Bedrooms
                  <input type="number" value={propertyForm.bedrooms} onChange={(e) => setPropertyForm((prev) => ({ ...prev, bedrooms: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                </label>
                <label className="text-sm text-accent">
                  Bathrooms
                  <input type="number" value={propertyForm.bathrooms} onChange={(e) => setPropertyForm((prev) => ({ ...prev, bathrooms: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                </label>
                <label className="text-sm text-accent">
                  Sq Ft
                  <input type="number" value={propertyForm.sqft} onChange={(e) => setPropertyForm((prev) => ({ ...prev, sqft: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                </label>
                <label className="text-sm text-accent">
                  Agent
                  <select value={propertyForm.agentId} onChange={(e) => setPropertyForm((prev) => ({ ...prev, agentId: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none">
                    <option value="">Select agent</option>
                    {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                  </select>
                </label>
                <label className="text-sm text-accent">
                  Property Type
                  <select value={propertyForm.type} onChange={(e) => setPropertyForm((prev) => ({ ...prev, type: e.target.value as PropertyType }))} className="mt-1.5 w-full border border-beige-dark/50 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none">
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </label>
                <label className="text-sm text-accent">
                  Status
                  <select value={propertyForm.status} onChange={(e) => setPropertyForm((prev) => ({ ...prev, status: e.target.value as PropertyStatus }))} className="mt-1.5 w-full border border-beige-dark/50 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none">
                    <option value="for-sale">For Sale</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                  </select>
                </label>
                <label className="text-sm text-accent md:col-span-2">
                  Main Image
                  {propertyForm.image ? (
                    <div className="mt-2 mb-2 h-36 w-full overflow-hidden border border-beige-dark/30">
                      <img src={propertyForm.image} alt="Current main" className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingPropMain}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingPropMain(true);
                      setMessage("");
                      try {
                        const [url] = await uploadImages([file]);
                        setPropertyForm((prev) => ({ ...prev, image: url }));
                      } catch {
                        setMessage("Main image upload failed.");
                      } finally {
                        setUploadingPropMain(false);
                        e.target.value = "";
                      }
                    }}
                    className="mt-1.5 block w-full border border-beige-dark/50 px-4 py-3 text-sm file:mr-4 file:border-0 file:bg-beige file:px-3 file:py-1 file:text-sm file:font-medium file:text-accent focus:border-accent focus:outline-none"
                  />
                  {uploadingPropMain ? <p className="mt-1 text-xs text-muted">Uploading...</p> : null}
                </label>
                <div className="text-sm text-accent md:col-span-2">
                  Gallery Images
                  {splitTextValues(propertyForm.imagesText).length > 0 ? (
                    <div className="mt-2 mb-2 grid grid-cols-3 gap-2">
                      {splitTextValues(propertyForm.imagesText).map((url, i) => (
                        <img key={i} src={url} alt={`Gallery ${i + 1}`} className="h-20 w-full object-cover border border-beige-dark/20" />
                      ))}
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingPropGallery}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (!files.length) return;
                      setUploadingPropGallery(true);
                      setMessage("");
                      try {
                        const urls = await uploadImages(files);
                        setPropertyForm((prev) => ({
                          ...prev,
                          imagesText: prev.imagesText
                            ? prev.imagesText + "\n" + urls.join("\n")
                            : urls.join("\n"),
                        }));
                      } catch {
                        setMessage("Gallery upload failed.");
                      } finally {
                        setUploadingPropGallery(false);
                        e.target.value = "";
                      }
                    }}
                    className="mt-1.5 block w-full border border-beige-dark/50 px-4 py-3 text-sm file:mr-4 file:border-0 file:bg-beige file:px-3 file:py-1 file:text-sm file:font-medium file:text-accent focus:border-accent focus:outline-none"
                  />
                  {uploadingPropGallery ? <p className="mt-1 text-xs text-muted">Uploading...</p> : null}
                  {splitTextValues(propertyForm.imagesText).length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setPropertyForm((prev) => ({ ...prev, imagesText: "" }))}
                      className="mt-1.5 text-xs text-red-500 underline"
                    >
                      Clear gallery
                    </button>
                  ) : null}
                </div>
                <label className="text-sm text-accent md:col-span-2">
                  Features
                  <textarea value={propertyForm.featuresText} onChange={(e) => setPropertyForm((prev) => ({ ...prev, featuresText: e.target.value }))} rows={4} className="mt-1.5 w-full resize-none border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" placeholder="One feature per line" />
                </label>
                <label className="text-sm text-accent md:col-span-2">
                  Description
                  <textarea value={propertyForm.description} onChange={(e) => setPropertyForm((prev) => ({ ...prev, description: e.target.value }))} rows={5} className="mt-1.5 w-full resize-none border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" />
                </label>
                <label className="inline-flex items-center gap-3 text-sm text-accent md:col-span-2">
                  <input type="checkbox" checked={propertyForm.isFeatured} onChange={(e) => setPropertyForm((prev) => ({ ...prev, isFeatured: e.target.checked }))} />
                  Show on home page as featured listing
                </label>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={() => void saveProperty()} disabled={saving} className="inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-light disabled:opacity-70">
                  <FeatherIcon icon="save" size={15} />
                  {saving ? "Saving..." : selectedPropertyId ? "Update Property" : "Create Property"}
                </button>
                {selectedPropertyId ? (
                  <button
                    onClick={() => void deleteProperty()}
                    disabled={saving}
                    className="inline-flex items-center gap-2 border border-red-300 px-5 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-70"
                  >
                    <FeatherIcon icon="trash-2" size={15} />
                    {saving ? "Working..." : "Delete Property"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {section === "partialHomes" ? (
          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="border border-beige-dark/30 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-accent">Partial Homes</h2>
                <button
                  onClick={() => {
                    setSelectedPartialHomeId(null);
                    setPartialHomeForm(blankPartialHomeForm());
                  }}
                  className="text-sm text-accent underline"
                >
                  New
                </button>
              </div>
              <div className="space-y-2">
                {partialHomes.map((home) => (
                  <button
                    key={home.id}
                    onClick={() => selectPartialHome(home)}
                    className={`w-full border px-4 py-3 text-left transition-colors ${
                      selectedPartialHomeId === home.id
                        ? "border-accent bg-beige-light"
                        : "border-beige-dark/30 hover:bg-beige-light"
                    }`}
                  >
                    <p className="font-medium text-accent">{home.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {home.city}, {home.state}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="border border-beige-dark/30 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-accent">
                {selectedPartialHomeId ? "Edit Partial Home" : "Create Partial Home"}
              </h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="text-sm text-accent"><span>Public ID</span><input value={partialHomeForm.id} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, id: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Title</span><input value={partialHomeForm.title} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, title: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent md:col-span-2"><span>Address</span><input value={partialHomeForm.address} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, address: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>City</span><input value={partialHomeForm.city} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, city: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>State</span><input value={partialHomeForm.state} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, state: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Full Price</span><input type="number" value={partialHomeForm.fullPrice} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, fullPrice: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Amount Paid</span><input type="number" value={partialHomeForm.amountPaid} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, amountPaid: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Remaining Amount</span><input type="number" value={partialHomeForm.remainingAmount} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, remainingAmount: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Percentage Paid</span><input type="number" value={partialHomeForm.percentagePaid} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, percentagePaid: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Bedrooms</span><input type="number" value={partialHomeForm.bedrooms} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, bedrooms: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Bathrooms</span><input type="number" value={partialHomeForm.bathrooms} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, bathrooms: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Sq Ft</span><input type="number" value={partialHomeForm.sqft} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, sqft: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Year Built</span><input type="number" value={partialHomeForm.yearBuilt} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, yearBuilt: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Property Type</span><select value={partialHomeForm.type} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, type: e.target.value as PropertyType }))} className="mt-1.5 w-full border border-beige-dark/50 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"><option value="house">House</option><option value="apartment">Apartment</option><option value="condo">Condo</option><option value="townhouse">Townhouse</option></select></label>
                <label className="text-sm text-accent"><span>Agent</span><select value={partialHomeForm.agentId} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, agentId: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 bg-white px-4 py-3 text-sm focus:border-accent focus:outline-none"><option value="">Select agent</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>
                <div className="text-sm text-accent md:col-span-2">
                  <span>Main Image</span>
                  {partialHomeForm.image ? (
                    <div className="mt-2 mb-2 h-36 w-full overflow-hidden border border-beige-dark/30">
                      <img src={partialHomeForm.image} alt="Current main" className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingPartialMain}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingPartialMain(true);
                      setMessage("");
                      try {
                        const [url] = await uploadImages([file]);
                        setPartialHomeForm((prev) => ({ ...prev, image: url }));
                      } catch {
                        setMessage("Main image upload failed.");
                      } finally {
                        setUploadingPartialMain(false);
                        e.target.value = "";
                      }
                    }}
                    className="mt-1.5 block w-full border border-beige-dark/50 px-4 py-3 text-sm file:mr-4 file:border-0 file:bg-beige file:px-3 file:py-1 file:text-sm file:font-medium file:text-accent focus:border-accent focus:outline-none"
                  />
                  {uploadingPartialMain ? <p className="mt-1 text-xs text-muted">Uploading...</p> : null}
                </div>
                <div className="text-sm text-accent md:col-span-2">
                  <span>Gallery Images</span>
                  {splitTextValues(partialHomeForm.imagesText).length > 0 ? (
                    <div className="mt-2 mb-2 grid grid-cols-3 gap-2">
                      {splitTextValues(partialHomeForm.imagesText).map((url, i) => (
                        <img key={i} src={url} alt={`Gallery ${i + 1}`} className="h-20 w-full object-cover border border-beige-dark/20" />
                      ))}
                    </div>
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingPartialGallery}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (!files.length) return;
                      setUploadingPartialGallery(true);
                      setMessage("");
                      try {
                        const urls = await uploadImages(files);
                        setPartialHomeForm((prev) => ({
                          ...prev,
                          imagesText: prev.imagesText
                            ? prev.imagesText + "\n" + urls.join("\n")
                            : urls.join("\n"),
                        }));
                      } catch {
                        setMessage("Gallery upload failed.");
                      } finally {
                        setUploadingPartialGallery(false);
                        e.target.value = "";
                      }
                    }}
                    className="mt-1.5 block w-full border border-beige-dark/50 px-4 py-3 text-sm file:mr-4 file:border-0 file:bg-beige file:px-3 file:py-1 file:text-sm file:font-medium file:text-accent focus:border-accent focus:outline-none"
                  />
                  {uploadingPartialGallery ? <p className="mt-1 text-xs text-muted">Uploading...</p> : null}
                  {splitTextValues(partialHomeForm.imagesText).length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setPartialHomeForm((prev) => ({ ...prev, imagesText: "" }))}
                      className="mt-1.5 text-xs text-red-500 underline"
                    >
                      Clear gallery
                    </button>
                  ) : null}
                </div>
                <label className="text-sm text-accent md:col-span-2"><span>Features</span><textarea value={partialHomeForm.featuresText} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, featuresText: e.target.value }))} rows={4} className="mt-1.5 w-full resize-none border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" placeholder="One feature per line" /></label>
                <label className="text-sm text-accent md:col-span-2"><span>Description</span><textarea value={partialHomeForm.description} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, description: e.target.value }))} rows={5} className="mt-1.5 w-full resize-none border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Payer Name</span><input value={partialHomeForm.payerName} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, payerName: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Payer Amount Paid</span><input type="number" value={partialHomeForm.payerAmountPaid} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, payerAmountPaid: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Payer Date Paid</span><input type="date" value={partialHomeForm.payerDatePaid} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, payerDatePaid: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent"><span>Payer Percentage Paid</span><input type="number" value={partialHomeForm.payerPercentagePaid} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, payerPercentagePaid: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="text-sm text-accent md:col-span-2"><span>Secure Code</span><input value={partialHomeForm.secureCode} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, secureCode: e.target.value }))} className="mt-1.5 w-full border border-beige-dark/50 px-4 py-3 text-sm focus:border-accent focus:outline-none" /></label>
                <label className="inline-flex items-center gap-3 text-sm text-accent md:col-span-2"><input type="checkbox" checked={partialHomeForm.isActive} onChange={(e) => setPartialHomeForm((prev) => ({ ...prev, isActive: e.target.checked }))} />Show this partial home on the public site</label>
              </div>
              <button onClick={() => void savePartialHome()} disabled={saving} className="mt-6 inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-light disabled:opacity-70">
                <FeatherIcon icon="save" size={15} />
                {saving ? "Saving..." : selectedPartialHomeId ? "Update Partial Home" : "Create Partial Home"}
              </button>
            </div>
          </div>
        ) : null}

        {section === "leads" ? (
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="border border-beige-dark/30 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-accent">Contact Messages</h2>
              <div className="mt-4 space-y-4">
                {contactMessages.map((item) => (
                  <div key={item.id} className="border border-beige-dark/30 p-4">
                    <p className="font-medium text-accent">
                      {item.first_name} {item.last_name}
                    </p>
                    <p className="mt-1 text-xs text-muted">{item.email}</p>
                    <p className="mt-2 text-sm text-muted">{item.message}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <select
                        value={item.status}
                        onChange={(e) => void updateContactStatus(item.id, e.target.value as LeadStatus)}
                        className="border border-beige-dark/50 bg-white px-3 py-2 text-xs focus:border-accent focus:outline-none"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                      </select>
                      <span className="text-xs text-muted">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-beige-dark/30 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-accent">Counter Pay Requests</h2>
              <div className="mt-4 space-y-4">
                {counterRequests.map((item) => (
                  <div key={item.id} className="border border-beige-dark/30 p-4">
                    <p className="font-medium text-accent">{item.partialHomeTitle}</p>
                    <p className="mt-1 text-xs text-muted">{item.email}</p>
                    <div className="mt-3 grid gap-3">
                      <select
                        value={item.status}
                        onChange={(e) => {
                          setCounterRequests((prev) =>
                            prev.map((current) =>
                              current.id === item.id ? { ...current, status: e.target.value as CounterRequestStatus } : current,
                            ),
                          );
                        }}
                        className="border border-beige-dark/50 bg-white px-3 py-2 text-xs focus:border-accent focus:outline-none"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                      <textarea
                        value={item.notes ?? ""}
                        onChange={(e) => {
                          setCounterRequests((prev) =>
                            prev.map((current) =>
                              current.id === item.id ? { ...current, notes: e.target.value } : current,
                            ),
                          );
                        }}
                        rows={3}
                        className="resize-none border border-beige-dark/50 px-3 py-2 text-xs focus:border-accent focus:outline-none"
                        placeholder="Owner notes"
                      />
                      <button
                        onClick={() => void updateCounterRequest(item)}
                        className="bg-accent px-3 py-2 text-xs font-medium text-white hover:bg-accent-light"
                      >
                        Save Request Update
                      </button>
                      <span className="text-xs text-muted">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-beige-dark/30 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-accent">Chat Inquiries</h2>
              <div className="mt-4 space-y-4">
                {chatInquiries.map((item) => (
                  <div key={item.id} className="border border-beige-dark/30 p-4">
                    <p className="font-medium text-accent">{item.email || "Anonymous visitor"}</p>
                    <p className="mt-2 text-sm text-muted">{item.message}</p>
                    <p className="mt-3 text-xs text-muted">
                      {item.source} • {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
