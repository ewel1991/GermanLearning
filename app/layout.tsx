import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import { TimerProvider } from "./context/TimerContext";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deutsch Lernen B2/C1",
  description: "Single-user German B2/C1 learning app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${fraunces.variable} ${plexSans.variable}`}>
      <body className="min-h-screen bg-parchment font-sans text-ink">
        <TimerProvider>
          <NavBar />
          {children}
        </TimerProvider>
      </body>
    </html>
  );
}
