import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import { TimerProvider } from "./context/TimerContext";
import { SessionProvider } from "./context/SessionContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
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
    <html lang="de" className={jakarta.variable}>
      <body className="min-h-screen bg-bg font-sans text-fg">
        <SessionProvider>
          <TimerProvider>
            <NavBar />
            {children}
          </TimerProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
