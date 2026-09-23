import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getPipelineHealth } from "@/lib/data";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#090a0f" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Global Development Pulse | Automated World Bank Data Platform",
    template: "%s | Global Development Pulse",
  },
  description:
    "A continuously maintained global development data platform that automatically collects, validates, transforms, versions, and visualizes public indicators from the World Bank Open Data API.",
  keywords: [
    "World Bank",
    "Global Development",
    "Data Platform",
    "Economic Indicators",
    "ETL Pipeline",
    "Data Visualization",
    "Open Data",
  ],
  authors: [{ name: "Global Development Pulse Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://global-development-pulse.vercel.app",
    title: "Global Development Pulse",
    description:
      "Automated global development data platform refreshed continuously via Python ETL pipelines and Git-based data versioning.",
    siteName: "Global Development Pulse",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const health = await getPipelineHealth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col font-sans antialiased selection:bg-accent-blue/20 selection:text-accent-blue">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar health={health} />
            <main className="flex-1">{children}</main>
            <Footer health={health} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
