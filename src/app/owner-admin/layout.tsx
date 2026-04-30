import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fresh Fields – Admin",
  manifest: "/admin-manifest.json",
};

export default function OwnerAdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
