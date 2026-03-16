import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://saver.delivery"),
  title: {
    default: "saver.delivery - Best Food Delivery Promo Codes & Deals",
    template: "%s | saver.delivery",
  },
  description:
    "Compare the latest promo codes and deals from DoorDash, Uber Eats, Grubhub, Postmates, Instacart, and Caviar. Save on every food delivery order.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://saver.delivery",
    siteName: "saver.delivery",
    title: "saver.delivery - Best Food Delivery Promo Codes & Deals",
    description:
      "Compare promo codes from DoorDash, Uber Eats, Grubhub & more. Updated daily.",
  },
  twitter: {
    card: "summary_large_image",
    title: "saver.delivery - Best Food Delivery Promo Codes & Deals",
    description:
      "Compare promo codes from DoorDash, Uber Eats, Grubhub & more. Updated daily.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://saver.delivery" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} antialiased`}>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
