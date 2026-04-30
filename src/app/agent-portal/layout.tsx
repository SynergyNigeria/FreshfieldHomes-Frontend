import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fresh Fields – Agent Portal",
  manifest: "/agent-manifest.json",
};

export default function AgentPortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
