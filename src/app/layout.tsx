import type { Metadata, Viewport } from "next";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-urdu",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Aghaaz — Take the Flight",
  description: "Take the Aghaaz Flight",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${nastaliq.variable}`}
        style={{
          background: "linear-gradient(165deg, #0a4a2e 0%, #063b22 20%, #042e1a 45%, #021810 75%, #010d08 100%)",
          backgroundAttachment: "fixed",
          color: "#ffffff",
        }}
      >
        <div className="aurora-bg">
          <div className="aurora-blob blob-1" />
          <div className="aurora-blob blob-2" />
          <div className="aurora-blob blob-3" />
        </div>
        <div className="glow-orb" />
        <div className="aurora-noise" />
        <div className="stars" />
        <div className="particles" />
        <div className="vignette" />
        {children}
      </body>
    </html>
  );
}
