import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/NavBar";
import { TimerProvider } from "./context/TimerContext";

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
    <html lang="de">
      <body className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <TimerProvider>
          <NavBar />
          {children}
        </TimerProvider>
      </body>
    </html>
  );
}
