import { Agent, PartialHome, PartialPayer, Property } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api";

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

function toNumber(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

function normalizeProperty(input: Property & { price: number | string }): Property {
  const imageFromList = Array.isArray(input.images) ? input.images[0] : undefined;
  const primaryImage = input.image || imageFromList || "";
  const normalizedImages = Array.isArray(input.images)
    ? input.images
    : primaryImage
      ? [primaryImage]
      : [];

  return {
    ...input,
    price: toNumber(input.price),
    image: primaryImage,
    images: normalizedImages,
  };
}

function normalizePartialHome(
  input: Omit<PartialHome, "fullPrice" | "amountPaid" | "remainingAmount"> & {
    fullPrice: number | string;
    amountPaid: number | string;
    remainingAmount: number | string;
    payer?: PartialPayer & { amountPaid: number | string };
  },
): PartialHome {
  const imageFromList = Array.isArray(input.images) ? input.images[0] : undefined;
  const primaryImage = input.image || imageFromList || "";
  const normalizedImages = Array.isArray(input.images)
    ? input.images
    : primaryImage
      ? [primaryImage]
      : [];

  return {
    ...input,
    fullPrice: toNumber(input.fullPrice),
    amountPaid: toNumber(input.amountPaid),
    remainingAmount: toNumber(input.remainingAmount),
    image: primaryImage,
    images: normalizedImages,
    payer: input.payer
      ? {
          ...input.payer,
          amountPaid: toNumber(input.payer.amountPaid),
        }
      : undefined,
  };
}

export async function getAgents(): Promise<Agent[]> {
  return requestJson<Agent[]>("/agents/");
}

export async function getProperties(): Promise<Property[]> {
  const data = await requestJson<Array<Property & { price: number | string }>>("/properties/");
  return data.map(normalizeProperty);
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const data = await requestJson<Array<Property & { price: number | string }>>("/properties/?featured=1");
  return data.map(normalizeProperty);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const data = await requestJson<Property & { price: number | string }>(`/properties/${id}/`);
    return normalizeProperty(data);
  } catch {
    return null;
  }
}

export async function getPartialHomes(): Promise<PartialHome[]> {
  const data = await requestJson<
    Array<Omit<PartialHome, "fullPrice" | "amountPaid" | "remainingAmount"> & {
      fullPrice: number | string;
      amountPaid: number | string;
      remainingAmount: number | string;
      payer?: PartialPayer & { amountPaid: number | string };
    }>
  >("/partial-homes/");
  return data.map(normalizePartialHome);
}

export async function getPartialHomeById(id: string): Promise<PartialHome | null> {
  try {
    const data = await requestJson<
      Omit<PartialHome, "fullPrice" | "amountPaid" | "remainingAmount"> & {
        fullPrice: number | string;
        amountPaid: number | string;
        remainingAmount: number | string;
        payer?: PartialPayer & { amountPaid: number | string };
      }
    >(`/partial-homes/${id}/`);
    return normalizePartialHome(data);
  } catch {
    return null;
  }
}

export async function getApartmentCities(): Promise<string[]> {
  const data = await requestJson<{ cities: string[] }>("/meta/apartment-cities/");
  return data.cities;
}

export async function unlockPartialHomeInfo(
  id: string,
  secureCode: string,
): Promise<PartialHome | null> {
  const response = await fetch(`${API_BASE}/partial-homes/${id}/unlock/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ secure_code: secureCode }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as Omit<PartialHome, "fullPrice" | "amountPaid" | "remainingAmount"> & {
    fullPrice: number | string;
    amountPaid: number | string;
    remainingAmount: number | string;
    payer?: PartialPayer & { amountPaid: number | string };
  };

  return normalizePartialHome(data);
}

export async function submitCounterPayRequest(partialHomeId: string, email: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/counter-pay-requests/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ partialHomeId, email }),
  });

  return response.ok;
}
