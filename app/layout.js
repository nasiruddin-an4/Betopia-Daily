import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthGuard from "../components/AuthGuard";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Betopia Daily | Premium Internal E-Commerce",
  description: "Exclusive grocery & fresh food delivery for Betopia Group employees.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body className={`${outfit.variable} antialiased min-h-screen flex flex-col bg-white font-sans`}>
        <Navbar />
        <main className="flex-1 w-full container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <AuthGuard>
            {children}
          </AuthGuard>
        </main>
        <Footer />
      </body>
    </html>
  );
}

