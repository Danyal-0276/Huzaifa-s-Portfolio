import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Muhammad Huzaifa Ali - Business Development & Lead Generation",
  description:
    "Muhammad Huzaifa Ali is a Lahore-based business development and lead generation specialist supporting B2B prospecting, outreach, and client acquisition.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
