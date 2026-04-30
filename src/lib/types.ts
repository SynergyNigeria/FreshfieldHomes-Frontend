export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image: string;
  images: string[];
  type: "house" | "apartment" | "condo" | "townhouse";
  status: "for-sale" | "pending" | "sold";
  yearBuilt: number;
  description: string;
  features: string[];
  agent: Agent;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  image: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: Date;
}

export interface PartialPayer {
  name: string;
  amountPaid: number;
  datePaid: string; // "Month DD, YYYY"
  percentagePaid: number;
}

export interface PartialHome {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  fullPrice: number;
  amountPaid: number;
  remainingAmount: number;
  percentagePaid: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  image: string;
  images: string[];
  type: "house" | "apartment" | "condo" | "townhouse";
  yearBuilt: number;
  description: string;
  features: string[];
  payer?: PartialPayer;
  agent: Agent;
}
